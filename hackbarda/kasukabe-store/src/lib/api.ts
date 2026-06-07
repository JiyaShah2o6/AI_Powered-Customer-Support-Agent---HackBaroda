/**
 * src/lib/api.ts
 * Typed API client for Shiro backend.
 * Import this instead of calling fetch() directly in ShiroChat.
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type MemoryNode = {
  type: "purchase" | "ticket" | "preference" | "interaction";
  value: string;
  confidence: number;
};

export type ChatApiResponse = {
  reply: string;
  memory_used: boolean;
  memory_nodes: MemoryNode[];
  retrieval_steps: string[];
  ticket_id: string;
  resolution_suggested: boolean;
  memory_stored?: boolean;
};

export type MemoryApiResponse = {
  customer_id: string;
  memories: { text: string; score: number; type: string }[];
  summary: string;
};

export async function sendChat(params: {
  message: string;
  customer_id: string;
  memory_enabled: boolean;
  conversation_history?: { role: "user" | "shiro"; content: string }[];
}): Promise<ChatApiResponse> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getCustomerMemory(customer_id: string): Promise<MemoryApiResponse> {
  const res = await fetch(`${BASE}/memory/${customer_id}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function recordPurchase(params: {
  customer_id: string;
  order_id: string;
  items: { name: string; qty: number }[];
  total: number;
}): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
