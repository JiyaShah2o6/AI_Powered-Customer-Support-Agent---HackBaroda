/**
 * ShiroChat.tsx — Kasukabe Laptop Store
 * Real backend integration + live Hindsight memory display
 * 
 * REPLACE the entire existing ShiroChat.tsx with this file.
 */

import { useEffect, useRef, useState } from "react";
import { Send, X, Brain, Bone, Dog, Zap, CheckCircle } from "lucide-react";
import { useApp } from "@/lib/store";

// ── Types ─────────────────────────────────────────────────────────────────────

type MemoryNode = {
  type: string;
  value: string;
  confidence: number;
};

type Msg = {
  id: number;
  role: "user" | "shiro";
  text: string;
  ts: number;
  memoryUsed?: boolean;
  memoryNodes?: MemoryNode[];
  retrievalSteps?: string[];
  ticketId?: string;
  resolutionSuggested?: boolean;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const GREETINGS: Record<string, string> = {
  kazama: "Hey Kazama! 🐾 I've loaded your support history. I remember your Action Kamen Pro 15 and your past tickets. What's up today?",
  nene: "Welcome back, Nene! 🎨 I have your Nene-chan Studio history ready. How can I help?",
  masao: "Hi Masao! 🌱 I remember your Masao Mini and your previous issues. What do you need today?",
};

const MEMORY_OFF_GREETING = "Woof! Memory is OFF — I won't read or save any of your personal data. Turn Hindsight ON when you want me to remember you. 🔒";
const GUEST_GREETING = "Woof! I'm Shiro 🐶 — log in and turn Memory ON so I can remember you!";

function chatStorageKey(username: string) {
  return `kasu_chat_${username}`;
}

function loadSavedMessages(username: string, memoryOn: boolean): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(chatStorageKey(username));
    if (raw) {
      const parsed = JSON.parse(raw) as Msg[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return [{
    id: Date.now(),
    role: "shiro",
    ts: Date.now(),
    text: memoryOn
      ? (GREETINGS[username] ?? `Welcome back! 🐾`)
      : MEMORY_OFF_GREETING,
  }];
}

const MEMORY_STEPS = [
  { icon: "🐾", text: "Connecting to Hindsight memory bank..." },
  { icon: "🧠", text: "Retrieving semantic memory nodes..." },
  { icon: "✨", text: "Matching against past tickets..." },
  { icon: "🎀", text: "Memory context attached!" },
];

const NODE_COLORS: Record<string, string> = {
  purchase: "bg-sky",
  ticket: "bg-coral",
  preference: "bg-lemon",
  interaction: "bg-mint",
};

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ShiroChat() {
  const { profile } = useApp();
  const [open, setOpen] = useState(false);
  const [memoryOn, setMemoryOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(-1);
  const [input, setInput] = useState("");
  const [liveMemoryNodes, setLiveMemoryNodes] = useState<MemoryNode[]>([]);
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (profile) return loadSavedMessages(profile.username, true);
    return [{ id: 1, role: "shiro", ts: Date.now(), text: GUEST_GREETING }];
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore saved chat when user logs back in
  useEffect(() => {
    if (profile) {
      setMessages(loadSavedMessages(profile.username, memoryOn));
      setLiveMemoryNodes([]);
    } else {
      setMessages([{ id: Date.now(), role: "shiro", ts: Date.now(), text: GUEST_GREETING }]);
      setLiveMemoryNodes([]);
    }
  }, [profile?.username]);

  // Persist chat per user
  useEffect(() => {
    if (!profile || typeof window === "undefined") return;
    localStorage.setItem(chatStorageKey(profile.username), JSON.stringify(messages));
  }, [messages, profile?.username]);

  // Privacy: clear personal memory UI when memory is turned off
  useEffect(() => {
    if (!memoryOn) {
      setLiveMemoryNodes([]);
      if (profile && messages.length <= 1) {
        setMessages([{
          id: Date.now(),
          role: "shiro",
          ts: Date.now(),
          text: MEMORY_OFF_GREETING,
        }]);
      }
    }
  }, [memoryOn]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("shiro:open", h);
    return () => window.removeEventListener("shiro:open", h);
  }, []);

  async function send() {
    const t = input.trim();
    if (!t || loading) return;

    const userMsg: Msg = { id: Date.now(), role: "user", text: t, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // Animate retrieval steps if memory is on
    if (memoryOn) {
      for (let i = 0; i < MEMORY_STEPS.length; i++) {
        setWorkflowStep(i);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    setWorkflowStep(-1);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "shiro")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: t,
          customer_id: profile?.username ?? "guest",
          memory_enabled: memoryOn,
          conversation_history: history,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Update live memory nodes only when memory is on
      if (memoryOn && data.memory_nodes?.length) {
        setLiveMemoryNodes(data.memory_nodes);
      }

      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "shiro",
          text: data.reply,
          ts: Date.now(),
          memoryUsed: data.memory_used,
          memoryNodes: data.memory_nodes,
          retrievalSteps: data.retrieval_steps,
          ticketId: data.ticket_id,
          resolutionSuggested: data.resolution_suggested,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "shiro",
          text: "⚠️ Shiro couldn't reach the server. Make sure the backend is running on port 8000!",
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border-ink shadow-cartoon-lg fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-sky animate-wobble"
        aria-label="Open Shiro"
      >
        <Dog className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[min(96vw,860px)]">
      <div className="border-ink-thick shadow-cartoon-lg flex h-[660px] max-h-[90vh] overflow-hidden rounded-3xl bg-card">
        
        {/* ── Memory Brain Sidebar ── */}
        <aside className="hidden w-64 shrink-0 flex-col gap-3 overflow-y-auto border-r-[3px] border-foreground bg-lemon p-4 sm:flex">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h4 className="font-bold">🧠 Hindsight Memory</h4>
          </div>

          {/* Customer card — hidden when memory off (privacy) */}
          {memoryOn && profile && (
            <div className="border-ink rounded-2xl bg-card p-3 text-xs">
              <div className="font-bold text-sm">👤 {profile.displayName}</div>
              <div className="text-muted-foreground mt-1">🛒 {profile.purchased}</div>
              <div className="mt-0.5 text-muted-foreground">📂 {profile.pastIssues.length} past tickets</div>
            </div>
          )}

          {!memoryOn && (
            <div className="border-ink rounded-2xl bg-coral/30 p-3 text-xs leading-snug">
              🔒 <span className="font-bold">Privacy mode</span> — no data is read from or saved to Hindsight.
            </div>
          )}

          {/* Memory status */}
          <div className="border-ink rounded-2xl bg-card p-3 relative">
            <div className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Memory Status</div>
            <div className={`text-sm font-bold flex items-center gap-2 ${memoryOn ? "text-green-700" : "text-muted-foreground"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${memoryOn ? "bg-mint animate-pulse" : "bg-muted"} border-2 border-foreground`} />
              {memoryOn ? "Hindsight Active" : "Memory Disabled"}
            </div>
            {memoryOn && (
              <div className="mt-2 text-[10px] text-muted-foreground">
                Bank: <span className="font-mono font-bold">kasukabe-{profile?.username ?? "guest"}</span>
              </div>
            )}
          </div>

          {/* Live memory nodes from last response */}
          {memoryOn && liveMemoryNodes.length > 0 && (
            <div className="border-ink rounded-2xl bg-card p-3">
              <div className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Live Memory Nodes</div>
              <ul className="space-y-2">
                {liveMemoryNodes.map((node, i) => (
                  <li key={i} className="text-xs">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`h-2 w-2 rounded-full border border-foreground ${NODE_COLORS[node.type] ?? "bg-mint"}`} />
                      <span className="font-bold capitalize">{node.type}</span>
                      <span className="ml-auto text-[9px] font-bold">{Math.round(node.confidence * 100)}%</span>
                    </div>
                    <p className="text-muted-foreground leading-tight line-clamp-2 pl-3.5">{node.value}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Past issues — only when memory on */}
          {memoryOn && profile && profile.pastIssues.length > 0 && (
            <div className="border-ink rounded-2xl bg-card p-3">
              <div className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Known Tickets</div>
              <ul className="space-y-1.5">
                {profile.pastIssues.map((issue, i) => (
                  <li key={i} className="text-xs border-ink rounded-xl bg-lemon/50 p-1.5">
                    <div className="font-bold truncate">{issue.issue}</div>
                    <div className="text-muted-foreground text-[9px] mt-0.5">{issue.date}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto border-ink rounded-2xl bg-sky/60 p-3 text-xs leading-snug">
            <Zap className="mb-1 inline h-3 w-3" /> Powered by <span className="font-bold">Hindsight</span>
            {memoryOn ? " — interactions stored and recalled when memory is ON." : " — memory disabled, no personal data accessed."}
          </div>
        </aside>

        {/* ── Main Chat Area ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          
          {/* Header */}
          <div className="border-ink-thick flex items-center gap-3 border-b-[3px] bg-sky px-4 py-3">
            <div className="border-ink relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
              <span className="text-xl">🐶</span>
              <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-foreground ${memoryOn ? "bg-mint animate-pulse" : "bg-muted"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">Shiro</span>
                <span className={`border-ink rounded-full px-2 py-0.5 text-[9px] font-bold ${memoryOn ? "bg-mint" : "bg-muted"}`}>
                  {memoryOn ? "🟢 Hindsight ON" : "⚪ Memory OFF"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {memoryOn
                  ? `Smart Memory Support${profile ? ` · ${profile.displayName}` : ""}`
                  : "Privacy mode — no personal data used"}
              </div>
            </div>
            <BoneToggle on={memoryOn} onChange={setMemoryOn} />
            <button onClick={() => setOpen(false)} className="border-ink flex h-8 w-8 items-center justify-center rounded-full bg-card hover:bg-coral" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-cream/40 px-4 py-4">
            {messages.map((m) => <Bubble key={m.id} msg={m} />)}
            
            {/* Thinking indicator */}
            {loading && (
              <div className="flex items-end gap-2">
                <Avatar />
                <div className="border-ink shadow-cartoon-sm rounded-2xl rounded-bl-md bg-card px-3 py-2 min-w-[220px]">
                  {memoryOn && workflowStep >= 0 ? (
                    <div className="space-y-1">
                      {MEMORY_STEPS.slice(0, workflowStep + 1).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold animate-[fade-in_0.3s_ease-out]">
                          <span>{s.icon}</span>
                          <span>{s.text}</span>
                          {i === workflowStep && <span className="ml-auto text-mint animate-pulse">●</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Dot delay="0s" /><Dot delay="0.15s" /><Dot delay="0.3s" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-ink-thick border-t-[3px] bg-card p-3">
            <div className="border-ink shadow-cartoon-sm flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={memoryOn ? "Ask Shiro — I remember everything 🐾" : "Memory is off — turn it on for personalized help"}
                className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading}
                className="border-ink flex h-8 w-8 items-center justify-center rounded-full bg-primary active:translate-y-0.5 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""} animate-[fade-in_0.3s_ease-out]`}>
      {!isUser && <Avatar />}
      <div className={`max-w-[82%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        
        {/* Memory context card — only when memory was used */}
        {!isUser && msg.memoryUsed && msg.memoryNodes && msg.memoryNodes.length > 0 && (
          <div className="border-ink shadow-cartoon-sm mb-2 w-full rounded-2xl bg-lemon p-3 animate-[fade-in_0.4s_ease-out]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase mb-2">
              <Brain className="h-3 w-3" /> 🧠 Memory Retrieved from Hindsight
            </div>
            <div className="space-y-1">
              {msg.memoryNodes.slice(0, 2).map((node, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full border border-foreground ${NODE_COLORS[node.type] ?? "bg-mint"}`} />
                  <span className="text-muted-foreground leading-tight">{node.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`border-ink shadow-cartoon-sm rounded-2xl px-3 py-2 text-sm ${isUser ? "rounded-br-md bg-primary" : "rounded-bl-md bg-card"}`}>
          <p className="leading-snug whitespace-pre-wrap">{msg.text}</p>
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
          {msg.memoryUsed && !isUser && (
            <span className="flex items-center gap-1 text-green-700 font-bold">
              <Brain className="h-2.5 w-2.5" /> memory
            </span>
          )}
          {msg.resolutionSuggested && !isUser && (
            <span className="flex items-center gap-1 text-blue-600 font-bold">
              <CheckCircle className="h-2.5 w-2.5" /> fix suggested
            </span>
          )}
          {msg.ticketId && !isUser && (
            <span className="font-mono">{msg.ticketId}</span>
          )}
          <span>{fmt(msg.ts)}</span>
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="border-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lemon text-base">🐶</div>
  );
}

function Dot({ delay }: { delay: string }) {
  return <span className="h-2 w-2 rounded-full bg-foreground animate-bounce" style={{ animationDelay: delay }} />;
}

function BoneToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`border-ink relative flex h-9 w-[140px] shrink-0 items-center rounded-full px-1 transition-colors ${on ? "bg-mint" : "bg-muted"}`}
      aria-label="Toggle Hindsight memory"
    >
      <span className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold uppercase pointer-events-none">
        <span className={on ? "opacity-100" : "opacity-40"}>Hindsight</span>
        <span className={on ? "opacity-100" : "opacity-40"}>{on ? "ON" : "OFF"}</span>
      </span>
      <span className={`border-ink relative flex h-7 w-12 items-center justify-center rounded-full bg-card transition-transform ${on ? "translate-x-[74px]" : "translate-x-0"}`}>
        <Bone className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
