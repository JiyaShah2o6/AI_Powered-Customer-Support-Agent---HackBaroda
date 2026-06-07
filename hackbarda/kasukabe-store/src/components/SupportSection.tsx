import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useApp } from "@/lib/store";

const FAQ = [
  { q: "Does Shiro really remember?", a: "Yes! Toggle Hindsight Memory ON in the chat and Shiro will sniff out your past chats, purchases, and resolved issues to give a personalized answer." },
  { q: "How long is shipping?", a: "Quack-fast — 2-4 business days across Kasukabe and beyond, with a Shiro paw-stamp tracker." },
  { q: "Can I return a laptop?", a: "Absolutely. Our 30-day cuddle-return policy covers full refund or swap, no questions asked." },
  { q: "Will Shiro remember me next time?", a: "Yep — your profile, orders, and past issues stay in memory across visits, so Shiro never starts from zero." },
  { q: "How do I escalate an unresolved issue?", a: "Open the Shiro chat with Memory ON; if confidence drops below 60%, a Kasukabe Defense Force agent is paged automatically." },
];

export function SupportSection() {
  const { profile } = useApp();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="support" className="relative z-10 mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10 text-center">
        <span className="border-ink shadow-cartoon-sm rounded-full bg-mint px-4 py-1 text-sm font-bold">🐶 Shiro Support Center</span>
        <h2 className="mt-3 text-4xl font-bold md:text-5xl">We've got your back (and your bytes)</h2>
        <p className="mt-2 text-muted-foreground">Premium support that remembers — so you don't have to repeat yourself.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border-ink shadow-cartoon rounded-3xl bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            🧠 Memory Timeline {profile && <span className="text-xs text-muted-foreground">— {profile.displayName}</span>}
          </h3>
          {profile ? (
            <ol className="relative space-y-4 border-l-[3px] border-dashed border-foreground/30 pl-5">
              {profile.pastIssues.map((it, i) => (
                <li
                  key={i}
                  className="border-ink relative rounded-2xl bg-cream p-4 transition-transform hover:-translate-y-0.5 animate-[fade-in_0.4s_ease-out]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="border-ink absolute -left-[30px] top-4 flex h-5 w-5 items-center justify-center rounded-full bg-mint text-[10px]">🐾</span>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">{it.date}</div>
                  <div className="mt-1 font-bold">Issue: {it.issue}</div>
                  <div className="mt-1 text-sm">✨ Resolution: {it.resolution}</div>
                  <div className="border-ink mt-2 inline-block rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold">Resolved</div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Log in to see your personal memory timeline.</p>
          )}
        </div>

        <div className="border-ink shadow-cartoon rounded-3xl bg-card p-6">
          <h3 className="mb-4 font-bold">❓ Frequently Asked</h3>
          <ul className="space-y-2">
            {FAQ.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q} className="border-ink overflow-hidden rounded-2xl bg-lemon/40">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-bold"
                  >
                    <span>{f.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-3 text-sm text-muted-foreground">{f.a}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
