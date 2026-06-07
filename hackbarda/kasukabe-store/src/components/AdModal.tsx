import { X } from "lucide-react";
import { useApp } from "@/lib/store";
import laptop1 from "@/assets/laptop-1.png.asset.json";

export function AdModal() {
  const { adOpen, setAdOpen } = useApp();
  if (!adOpen) return null;
  const confetti = ["🎉", "✨", "🌸", "⭐", "🐾", "🎊", "💫"];
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setAdOpen(false)} />
      <div className="border-ink-thick shadow-cartoon-lg relative w-full max-w-2xl overflow-hidden rounded-3xl bg-card animate-[scale-in_0.3s_ease-out]">
        {/* Confetti */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="absolute -top-6 text-xl"
              style={{
                left: `${(i * 17) % 100}%`,
                animation: `petal-fall ${4 + (i % 5)}s linear ${i * 0.2}s infinite`,
              }}
            >
              {confetti[i % confetti.length]}
            </span>
          ))}
        </div>

        <div className="border-ink-thick flex items-center justify-between border-b-[3px] bg-coral px-5 py-3">
          <h3 className="font-bold">📺 Kasukabe Promo</h3>
          <button onClick={() => setAdOpen(false)} className="border-ink flex h-8 w-8 items-center justify-center rounded-full bg-card">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative p-6">
          <div className="border-ink relative mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky via-cream to-lemon">
            <img src={laptop1.url} alt="Action Kamen Pro" className="max-h-[80%] animate-float-y drop-shadow-[6px_6px_0_var(--ink)]" />
            <span className="absolute left-4 top-4 text-3xl animate-wobble">🦸</span>
            <span className="absolute bottom-4 right-4 text-4xl animate-wobble">🐶</span>
            <span className="absolute left-1/3 top-6 text-2xl animate-float-y">⭐</span>
          </div>
          <h4 className="text-center font-display text-2xl font-bold">"Kasukabe Defense, ACTIVATE!"</h4>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Powered by hero-grade chips. Loved by every kid in town. Now in India — at Indian prices!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-bold">
            <span className="border-ink rounded-full bg-mint px-3 py-1">⚡ 144Hz</span>
            <span className="border-ink rounded-full bg-lemon px-3 py-1">🧠 32GB RAM</span>
            <span className="border-ink rounded-full bg-sky px-3 py-1">🐾 Shiro Approved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
