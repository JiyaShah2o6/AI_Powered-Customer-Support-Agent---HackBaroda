import { useEffect, useRef, useState } from "react";
import { Send, X, Sparkles, Brain, Bone, Dog } from "lucide-react";
import { useApp } from "@/lib/store";
import { LAPTOPS } from "@/lib/laptops";

type Msg = {
  id: number;
  role: "user" | "shiro";
  text: string;
  usedMemory?: boolean;
  ts: number;
  retrievalSteps?: string[];
  memoryImpact?: MemoryImpact;
};
type MemoryImpact = {
  previousPurchase: string;
  previousIssue: string;
  previousResolution: string;
  confidence: number;
  source: string;
};

const STATUS_ON = [
  { icon: "🐾", text: "Searching previous conversations..." },
  { icon: "🧠", text: "Retrieving memory nodes..." },
  { icon: "✨", text: "Matching historical issue..." },
  { icon: "🎀", text: "Memory attached successfully!" },
];
const STATUS_OFF = [{ icon: "💤", text: "Napping in the sun..." }];

const RECS: Record<string, string[]> = {
  kazama: ["kazama", "shiro"],
  nene: ["nene"],
  masao: ["masao", "shiro"],
};

const GREETINGS: Record<string, string> = {
  kazama: "Welcome back Kazama! 🐾 I remember your Action Kamen Pro purchase. How can I help today?",
  nene: "Welcome back Nene! 🎨 Ready to continue where we left off?",
  masao: "Hi Masao! 🌱 I found your previous support history — what's up?",
};

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ShiroChat() {
  const { profile } = useApp();
  const [open, setOpen] = useState(false);
  const [memoryOn, setMemoryOn] = useState(true);
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: 1,
      role: "shiro",
      ts: Date.now(),
      text: profile
        ? GREETINGS[profile.username] ?? `Woof! Welcome back, ${profile.displayName}! 🐾`
        : "Woof! I'm Shiro 🐶 — your smart memory pup.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(-1);
  const [statusIdx, setStatusIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setStatusIdx((i) => i + 1), 1800);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, workflowStep]);
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("shiro:open", h);
    return () => window.removeEventListener("shiro:open", h);
  }, []);

  const statuses = memoryOn ? STATUS_ON : STATUS_OFF;
  const currentStatus = statuses[statusIdx % statuses.length];

  async function send() {
    const t = input.trim();
    if (!t) return;
    const userMsg: Msg = { id: Date.now(), role: "user", text: t, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    if (memoryOn) {
      for (let i = 0; i < STATUS_ON.length; i++) {
        setWorkflowStep(i);
        await new Promise((r) => setTimeout(r, 450));
      }
      setWorkflowStep(-1);
    } else {
      await new Promise((r) => setTimeout(r, 900));
    }

    const { reply, steps, impact } = buildReply(t, memoryOn, profile);
    setMessages((m) => [...m, { id: Date.now() + 1, role: "shiro", text: reply, usedMemory: memoryOn, ts: Date.now(), retrievalSteps: steps, memoryImpact: impact }]);
    setThinking(false);
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

  const recIds = profile ? RECS[profile.username] ?? [] : [];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[min(94vw,820px)]">
      <div className="border-ink-thick shadow-cartoon-lg flex h-[640px] max-h-[88vh] overflow-hidden rounded-3xl bg-card">
        {/* Memory Brain sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-3 overflow-y-auto border-r-[3px] border-foreground bg-lemon p-4 sm:flex">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h4 className="font-bold leading-tight">🧠 Shiro's Memory Brain</h4>
          </div>

          {profile && (
            <div className="border-ink rounded-2xl bg-card p-3 text-xs">
              <div className="font-bold">👤 {profile.displayName}</div>
              <div className="text-muted-foreground">🛒 {profile.purchased}</div>
              <div className="mt-1 text-muted-foreground">⭐ Fav: {profile.favorite}</div>
            </div>
          )}

          <div className="border-ink relative rounded-2xl bg-card p-3">
            <div className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Status</div>
            <div key={currentStatus.text} className="flex items-start gap-2 animate-sniff">
              <span className="text-lg">{currentStatus.icon}</span>
              <span className="text-sm font-semibold">{currentStatus.text}</span>
            </div>
            {memoryOn && <span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-mint" />}
          </div>

          <div className="border-ink rounded-2xl bg-card p-3">
            <div className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Memory Nodes</div>
            <ul className="space-y-1.5 text-xs">
              <NodePill label={`Past issues (${profile?.pastIssues.length ?? 0})`} active={memoryOn} dot="bg-mint" />
              <NodePill label="Wishlist 🐾" active={memoryOn} dot="bg-coral" />
              <NodePill label="Favorite" active={memoryOn} dot="bg-sky" />
              <NodePill label="Recent activity" active={memoryOn} dot="bg-primary" />
            </ul>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] font-bold uppercase">
                <span>Confidence</span><span>{memoryOn ? 92 : 0}%</span>
              </div>
              <div className="border-ink h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-mint transition-all duration-700" style={{ width: memoryOn ? "92%" : "0%" }} />
              </div>
            </div>
          </div>

          {profile && recIds.length > 0 && (
            <div className="border-ink rounded-2xl bg-card p-3">
              <div className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Recommended</div>
              <ul className="space-y-1 text-xs">
                {recIds.map((id) => {
                  const l = LAPTOPS.find((x) => x.id === id);
                  return l ? <li key={id} className="font-semibold">⭐ {l.name}</li> : null;
                })}
              </ul>
            </div>
          )}

          <div className="mt-auto border-ink rounded-2xl bg-mint p-3 text-xs leading-snug">
            <Sparkles className="mb-1 inline h-3.5 w-3.5" /> Tip: Memory ON makes Shiro recall your past tickets.
          </div>
        </aside>

        {/* Main chat */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-ink-thick flex items-center gap-3 border-b-[3px] bg-sky px-4 py-3">
            <div className="border-ink relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
              <span className="text-xl">🐶</span>
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-mint border-2 border-foreground animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-bold leading-tight">Shiro</span>
                <span className={`border-ink rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${memoryOn ? "bg-mint" : "bg-muted"}`}>
                  {memoryOn ? "🟢 Memory Active" : "⚪ Memory Disabled"}
                </span>
              </div>
              <div className="truncate text-xs text-muted-foreground">The Smart Memory Pup{profile && ` · ${profile.displayName}`}</div>
            </div>
            <BoneToggle on={memoryOn} onChange={setMemoryOn} />
            <button onClick={() => setOpen(false)} className="border-ink ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-card hover:bg-coral" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-cream/40 px-4 py-4">
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {thinking && (
              <div className="flex items-end gap-2">
                <Avatar />
                <div className="border-ink shadow-cartoon-sm rounded-2xl rounded-bl-md bg-card px-3 py-2 min-w-[200px]">
                  {memoryOn && workflowStep >= 0 ? (
                    <div className="space-y-1">
                      {STATUS_ON.slice(0, workflowStep + 1).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold animate-[fade-in_0.3s_ease-out]">
                          <span>{s.icon}</span>
                          <span>{s.text}</span>
                          {i === workflowStep && <span className="ml-auto text-mint">●</span>}
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

          <div className="border-ink-thick border-t-[3px] bg-card p-3">
            <div className="border-ink shadow-cartoon-sm flex items-center gap-2 rounded-full bg-background px-3 py-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Shiro about a laptop or issue..."
                className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button onClick={send} className="border-ink flex h-8 w-8 items-center justify-center rounded-full bg-primary active:translate-y-0.5" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""} animate-[fade-in_0.3s_ease-out]`}>
      {!isUser && <Avatar />}
      <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {msg.memoryImpact && <MemoryImpactCard impact={msg.memoryImpact} />}
        <div className={`border-ink shadow-cartoon-sm rounded-2xl px-3 py-2 text-sm ${isUser ? "rounded-br-md bg-primary" : "rounded-bl-md bg-card"}`}>
          <p className="leading-snug whitespace-pre-wrap">{msg.text}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          {msg.usedMemory && !isUser && <><Brain className="h-2.5 w-2.5" /> memory ·</>}
          <span>{fmt(msg.ts)}</span>
        </div>
      </div>
    </div>
  );
}

function MemoryImpactCard({ impact }: { impact: MemoryImpact }) {
  return (
    <div className="border-ink-thick shadow-cartoon-sm mb-2 w-full rounded-2xl bg-lemon p-3 animate-[fade-in_0.4s_ease-out]">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase">
        <Brain className="h-3.5 w-3.5" /> 🧠 Memory Impact
      </div>
      <div className="space-y-1 text-xs">
        <Row k="Previous Purchase" v={impact.previousPurchase} />
        <Row k="Previous Issue" v={impact.previousIssue} />
        <Row k="Previous Resolution" v={impact.previousResolution} />
        <Row k="Memory Source" v={impact.source} />
      </div>
      <div className="mt-2">
        <div className="mb-0.5 flex justify-between text-[10px] font-bold">
          <span>Confidence</span><span>{impact.confidence}%</span>
        </div>
        <div className="border-ink h-1.5 overflow-hidden rounded-full bg-card">
          <div className="h-full bg-mint transition-all duration-700" style={{ width: `${impact.confidence}%` }} />
        </div>
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-[110px] shrink-0 font-bold text-muted-foreground">{k}:</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

function Avatar() {
  return <div className="border-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lemon text-base">🐶</div>;
}
function Dot({ delay }: { delay: string }) {
  return <span className="h-2 w-2 rounded-full bg-foreground animate-sniff" style={{ animationDelay: delay }} />;
}
function NodePill({ label, active, dot }: { label: string; active: boolean; dot: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full border-2 border-foreground ${active ? `${dot} animate-pulse` : "bg-muted"}`} />
      <span className={active ? "font-semibold" : "text-muted-foreground line-through"}>{label}</span>
    </li>
  );
}

function BoneToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`border-ink relative flex h-9 w-[140px] shrink-0 items-center rounded-full px-1 transition-colors ${on ? "bg-mint" : "bg-muted"}`}
      aria-label="Toggle hindsight memory"
    >
      <span className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold uppercase">
        <span className={on ? "opacity-100" : "opacity-40"}>Memory</span>
        <span className={on ? "opacity-100" : "opacity-40"}>{on ? "ON" : "OFF"}</span>
      </span>
      <span className={`border-ink relative flex h-7 w-12 items-center justify-center rounded-full bg-card transition-transform ${on ? "translate-x-[74px]" : "translate-x-0"}`}>
        <Bone className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function buildReply(q: string, memoryOn: boolean, profile: ReturnType<typeof useApp>["profile"]) {
  const lower = q.toLowerCase();
  const steps = memoryOn ? ["🐾 Sniffing tickets...", "🦴 Searching memory nodes...", "✨ Memory retrieved!"] : undefined;

  let impact: MemoryImpact | undefined;
  if (memoryOn && profile && profile.pastIssues.length > 0) {
    const hit = profile.pastIssues[0];
    impact = {
      previousPurchase: profile.purchased,
      previousIssue: hit.issue,
      previousResolution: hit.resolution,
      confidence: 92,
      source: `Past Ticket #${100 + profile.pastIssues.length}`,
    };
  }

  if (memoryOn && profile && (lower.includes("battery") || lower.includes("issue") || lower.includes("problem") || lower.includes("help"))) {
    const hit = profile.pastIssues[0];
    return {
      steps,
      impact,
      reply: `🎀 Found a similar issue from ${hit.date}: "${hit.issue}". Last time we fixed it with: ${hit.resolution}. Want me to apply the same fix?`,
    };
  }
  if (lower.includes("cheap") || lower.includes("budget")) return { steps, impact, reply: `Try the Masao Mini at ₹74,999 — small body, big heart! 🌱` };
  if (lower.includes("power") || lower.includes("gaming") || lower.includes("fast")) return { steps, impact, reply: `Action Kamen Pro will defend your frame rate at 144fps. 🦸‍♂️ ₹1,89,999.` };
  if (lower.includes("creative") || lower.includes("design") || lower.includes("art")) return { steps, impact, reply: `Nene-chan Studio has a beautiful display for sketching! 🐰🎨` };
  if (lower.includes("memory") || lower.includes("ram")) return { steps, impact, reply: `Shiro Memory Max packs 64GB — never forgets a tab. 🐶💾` };
  if (lower.includes("recommend") || lower.includes("suggest")) {
    const ids = profile ? RECS[profile.username] ?? [] : [];
    const picks = ids.map((id) => LAPTOPS.find((l) => l.id === id)?.name).filter(Boolean).join(" and ");
    return { steps, impact, reply: profile ? `Based on your history, I'd recommend the ${picks}. 🐾` : `Try the Kasukabe Defense Book — solid all-rounder!` };
  }
  return {
    steps,
    impact,
    reply: memoryOn && profile
      ? `Sniff sniff... I remember your ${profile.purchased}. Tell me what's happening and I'll match it with a past resolution!`
      : "Hindsight is off — turn it ON so I can recall your past chats and personalize my help. 🦴",
  };
}
