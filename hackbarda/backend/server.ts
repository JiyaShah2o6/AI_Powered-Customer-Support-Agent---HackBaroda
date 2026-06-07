import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Groq } from "groq-sdk";
import { HindsightClient } from "@vectorize-io/hindsight-client";

// Ingest environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Initialize Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const hindsight = new HindsightClient({
  baseUrl: process.env.HINDSIGHT_API_URL || "https://api.hindsight.vectorize.io",
  apiKey: process.env.HINDSIGHT_API_KEY,
});

// Profile Database (from frontend store configuration)
interface PastIssue {
  issue: string;
  resolution: string;
  date: string;
}

interface CustomerProfile {
  displayName: string;
  purchased: string;
  pastIssues: PastIssue[];
}

const PROFILES: Record<string, CustomerProfile> = {
  kazama: {
    displayName: "Kazama",
    purchased: "Action Kamen Pro 15",
    pastIssues: [
      { issue: "Battery drains quickly during study sessions", resolution: "Enabled Honor-Saver mode, +3hr life", date: "2025-09-12" },
      { issue: "Keyboard backlight too bright at night", resolution: "Set auto-dim after 9pm", date: "2025-10-04" },
    ],
  },
  nene: {
    displayName: "Nene",
    purchased: "Nene-chan Studio",
    pastIssues: [
      { issue: "Stylus pressure not smooth in sketches", resolution: "Updated Bunny pen driver v2.4", date: "2025-08-22" },
      { issue: "Color profile off on external monitor", resolution: "Applied Nene-chan vivid LUT", date: "2025-11-01" },
    ],
  },
  masao: {
    displayName: "Masao",
    purchased: "Masao Mini",
    pastIssues: [
      { issue: "Laptop too heavy in my backpack", resolution: "Recommended Masao Mini upgrade path", date: "2025-07-19" },
      { issue: "Fan noise scares me at night", resolution: "Enabled Quiet Pup mode", date: "2025-10-28" },
    ],
  },
};

// Tracks which memory banks have been initialized during this runtime
const initializedBanks = new Set<string>();

/**
 * Initializes a customer's Hindsight memory bank with their default profile facts.
 */
async function initializeMemoryBank(customerId: string) {
  const bankId = `kasukabe-${customerId}`;
  if (initializedBanks.has(bankId)) return;

  const profile = PROFILES[customerId];
  if (!profile) return;

  console.log(`Initializing memory bank for ${customerId}: ${bankId}`);

  try {
    // Retain purchase details
    await hindsight.retain(
      bankId,
      `Customer ${profile.displayName} purchased an ${profile.purchased} laptop.`
    );

    // Retain historical support issues
    for (const ticket of profile.pastIssues) {
      await hindsight.retain(
        bankId,
        `Customer ${profile.displayName}'s past ticket from ${ticket.date}: "${ticket.issue}". Resolution: ${ticket.resolution}.`
      );
    }

    initializedBanks.add(bankId);
    console.log(`Successfully initialized memory bank: ${bankId}`);
  } catch (error) {
    console.error(`Failed to initialize memory bank ${bankId}:`, error);
  }
}

/**
 * POST /chat
 * Endpoint called by the React frontend chatbot.
 */
function mapMemoryResults(results: any[]) {
  return results.map((item: any) => {
    const text = item.content || item.text || item.value || JSON.stringify(item);
    let type: "purchase" | "ticket" | "preference" | "interaction" = "interaction";
    const lowerText = text.toLowerCase();

    if (lowerText.includes("purchased") || lowerText.includes("bought") || lowerText.includes("laptop")) {
      type = "purchase";
    } else if (
      lowerText.includes("ticket") ||
      lowerText.includes("issue") ||
      lowerText.includes("resolution") ||
      lowerText.includes("resolved") ||
      lowerText.includes("fixed") ||
      lowerText.includes("confirmed") ||
      lowerText.includes("mode") ||
      lowerText.includes("saver") ||
      lowerText.includes("fan") ||
      lowerText.includes("noise") ||
      lowerText.includes("stylus") ||
      lowerText.includes("driver")
    ) {
      type = "ticket";
    } else if (lowerText.includes("prefer") || lowerText.includes("like") || lowerText.includes("favorite")) {
      type = "preference";
    }

    return {
      type,
      value: text,
      confidence: item.confidence ?? 0.95,
    };
  });
}

app.post("/chat", async (req, res) => {
  try {
    const { message, customer_id, memory_enabled, conversation_history } = req.body;
    if (!message || !customer_id) {
      res.status(400).json({ error: "Missing message or customer_id in request body." });
      return;
    }

    const customerId = customer_id.toLowerCase().trim();
    const profile = PROFILES[customerId] || { displayName: "Guest", purchased: "None", pastIssues: [] };
    const memoryOn = memory_enabled === true;
    const bankId = `kasukabe-${customerId}`;

    // Only touch Hindsight when the user has memory enabled (privacy)
    if (memoryOn && customerId !== "guest") {
      await initializeMemoryBank(customerId);
    }

    let memoryContext = "";
    let memoryNodes: any[] = [];
    let memoryUsed = false;

    // Recall from Hindsight memory bank if enabled
    if (memoryOn && customerId !== "guest") {
      try {
        console.log(`Recalling memories for bank: ${bankId} with query: "${message}"`);
        const recallRes = await hindsight.recall(bankId, message);
        const results = recallRes.results || [];
        console.log(`Retrieved ${results.length} memories from Hindsight.`);

        if (results.length > 0) {
          memoryUsed = true;
          // Build textual context for Groq
          memoryContext = results
            .map((item: any) => {
              const text = item.content || item.text || item.value || JSON.stringify(item);
              return `- ${text}`;
            })
            .join("\n");

          memoryNodes = mapMemoryResults(results);
        }
      } catch (error) {
        console.error("Failed to recall memories from Hindsight:", error);
      }
    }

    const historyMessages: { role: "user" | "assistant"; content: string }[] = Array.isArray(conversation_history)
      ? conversation_history
          .filter((m: { role?: string; content?: string }) => m?.content && (m.role === "user" || m.role === "shiro" || m.role === "assistant"))
          .slice(-10)
          .map((m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" as const : "assistant" as const,
            content: m.content,
          }))
      : [];

    const memoryInstructions = memoryOn
      ? `Memory is ON. Analyze the customer's latest message AND the conversation history.
Store important facts the CUSTOMER stated — especially when they:
- Confirm a fix worked or a problem is resolved
- Describe what THEY did to fix an issue (prioritize their words over your earlier suggestions)
- Share preferences, settings, or device details worth remembering

Set memory_to_store to a concise third-person fact (e.g. "Customer Kazama confirmed they fixed the battery drain by enabling Honor-Saver mode and it now lasts 5 hours."). Use null if nothing new is worth saving.`
      : `Memory is OFF for privacy. Do NOT reference any stored customer history. Set memory_to_store to null.`;

    const systemPrompt = `You are Shiro 🐶, the smart customer support dog of Kasukabe Laptop Store.
You are helping a customer named ${profile.displayName}.
Customer Username: ${customerId}
${memoryOn ? `Customer Profile Laptop: ${profile.purchased}` : "Memory is disabled — do not use or mention any personal purchase history, past tickets, or stored memories."}

Your Persona:
- Friendly, smart support dog.
- Natural use of dog/puppy puns ("Woof!", "bark!", "paw-some", "ruff day").
- Keep replies concise but extremely helpful.

${memoryOn && memoryContext ? `Retrieved Hindsight Memory Context:
${memoryContext}

CRITICAL: The customer may have purchased other laptops or items stored in their memory. You MUST check the Retrieved Hindsight Memory Context above for all laptops/purchases they own and combine them when answering questions about their owned laptops or purchase history.` : ""}

${memoryInstructions}

Provide your response in JSON format. The response must match this schema exactly:
{
  "reply": "Shiro's chat message to the customer",
  "ticket_id": "TICKET-XXXX" or null (only if they report a NEW problem/issue),
  "resolution_suggested": true or false (if you suggested a fix),
  "memory_to_store": "concise fact to save in Hindsight, or null"
}
`;

    const groqMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: message },
    ];

    console.log("Sending chat prompt to Groq...");
    const groqRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: groqMessages,
      temperature: 0.7,
    });

    const choiceContent = groqRes.choices[0]?.message?.content;
    if (!choiceContent) {
      throw new Error("Received empty response from Groq.");
    }

    const parsedResponse = JSON.parse(choiceContent);
    let memoryStored = false;

    // Only write to Hindsight when memory is explicitly enabled
    if (memoryOn && customerId !== "guest") {
      const factsToStore: string[] = [];

      if (parsedResponse.memory_to_store?.trim()) {
        factsToStore.push(parsedResponse.memory_to_store.trim());
      }

      if (parsedResponse.ticket_id) {
        factsToStore.push(
          `Customer ${profile.displayName} raised ticket ${parsedResponse.ticket_id} for issue: "${message}". Shiro suggested: "${parsedResponse.reply}".`
        );
      }

      for (const fact of factsToStore) {
        console.log(`Learning fact in Hindsight: "${fact}"`);
        await hindsight.retain(bankId, fact);
        memoryStored = true;
      }

      if (memoryStored) {
        try {
          const recallRes = await hindsight.recall(bankId, message);
          const results = recallRes.results || [];
          if (results.length > 0) {
            memoryNodes = mapMemoryResults(results);
          }
        } catch (error) {
          console.error("Failed to refresh memories after store:", error);
        }
      }
    }

    // Assembly response matching ChatApiResponse structure
    const retrievalSteps = memoryOn
      ? [
          "Connecting to Hindsight memory bank...",
          "Retrieving semantic memory nodes...",
          "Matching against past tickets...",
          "Memory context attached!"
        ]
      : [];

    res.json({
      reply: parsedResponse.reply,
      memory_used: memoryOn && (memoryUsed || memoryStored),
      memory_nodes: memoryOn ? memoryNodes : [],
      retrieval_steps: retrievalSteps,
      ticket_id: parsedResponse.ticket_id || undefined,
      resolution_suggested: parsedResponse.resolution_suggested || false,
      memory_stored: memoryStored,
    });

  } catch (error: any) {
    console.error("Error handling chat request:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

/**
 * POST /purchase
 * Stores a new laptop purchase in the customer's Hindsight memory bank.
 */
app.post("/purchase", async (req, res) => {
  try {
    const { customer_id, order_id, items, total } = req.body;
    if (!customer_id || !order_id || !items?.length) {
      res.status(400).json({ error: "Missing customer_id, order_id, or items in request body." });
      return;
    }

    const customerId = customer_id.toLowerCase().trim();
    if (customerId === "guest") {
      res.status(400).json({ error: "Guest purchases cannot be stored in memory." });
      return;
    }

    const profile = PROFILES[customerId];
    const displayName = profile?.displayName ?? customerId;
    const bankId = `kasukabe-${customerId}`;
    const date = new Date().toISOString().slice(0, 10);

    await initializeMemoryBank(customerId);

    for (const item of items) {
      const qty = item.qty ?? 1;
      const fact = `Customer ${displayName} purchased ${qty}x ${item.name} laptop (order ${order_id}) on ${date}.`;
      console.log(`Storing purchase in Hindsight: "${fact}"`);
      await hindsight.retain(bankId, fact);
    }

    const itemList = items.map((item: { name: string; qty?: number }) => `${item.qty ?? 1}x ${item.name}`).join(", ");
    const summaryFact = `Customer ${displayName} completed checkout order ${order_id} on ${date} for ${total ?? "unknown total"}. Items: ${itemList}.`;
    await hindsight.retain(bankId, summaryFact);

    res.json({ success: true, customer_id: customerId, order_id });
  } catch (error: any) {
    console.error("Error storing purchase in Hindsight:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

/**
 * GET /memory/:customer_id
 * Retrieves the full memory nodes and profile summary.
 */
app.get("/memory/:customer_id", async (req, res) => {
  try {
    const { customer_id } = req.params;
    const customerId = customer_id.toLowerCase().trim();
    const bankId = `kasukabe-${customerId}`;

    // Initialize first if needed
    if (customerId !== "guest") {
      await initializeMemoryBank(customerId);
    }

    console.log(`Retrieving memory overview for: ${bankId}`);
    const recallRes = await hindsight.recall(bankId, "laptop purchase, past issues, and settings");
    const results = recallRes.results || [];

    const memories = results.map((item: any) => {
      const text = item.content || item.text || item.value || JSON.stringify(item);
      return {
        text,
        score: item.confidence ?? 0.95,
        type: text.toLowerCase().includes("purchase") ? "purchase" : "ticket",
      };
    });

    const profile = PROFILES[customerId];
    const summary = profile
      ? `${profile.displayName} purchased an ${profile.purchased} laptop and has ${profile.pastIssues.length} registered past tickets.`
      : "No customer profile found.";

    res.json({
      customer_id: customerId,
      memories,
      summary,
    });

  } catch (error: any) {
    console.error("Error retrieving memories:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Shiro Chat Backend is running on port ${PORT}`);
});
