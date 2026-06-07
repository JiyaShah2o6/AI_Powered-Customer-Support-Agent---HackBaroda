import { Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { LAPTOPS } from "@/lib/laptops";

export function Hero() {
  const { profile } = useApp();
  const kamen = LAPTOPS[0];

  function browse() {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }
  function chat() {
    window.dispatchEvent(new CustomEvent("shiro:open"));
  }

  return (
    <header id="top" className="relative">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="relative z-10">
          {profile && (
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
              ✨ Welcome back, <span className="text-foreground">{profile.displayName}!</span>
            </div>
          )}
          <div className="border-ink shadow-cartoon-sm mb-5 inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-bold">
            <Sparkles className="h-3 w-3" /> 🐾 Shiro Approved · Memory-powered support
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            Smart Laptops.{" "}
            <span className="border-ink shadow-cartoon-sm inline-block -rotate-2 rounded-2xl bg-coral px-3">Smarter</span> Memories.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Powered by Shiro AI — personalized support that remembers every customer, every purchase, and every issue.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={chat}
              className="border-ink shadow-cartoon rounded-full bg-primary px-6 py-3 font-bold active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Chat with Shiro 🐶
            </button>
            <button
              onClick={browse}
              className="border-ink shadow-cartoon-sm rounded-full bg-card px-6 py-3 font-bold"
            >
              Browse laptops →
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs">
            {["🧠 Persistent Memory", "🐾 Personalized Support", "🎀 Remembers Your History", "🛡️ Kasukabe Defense Care"].map((t) => (
              <div key={t} className="border-ink shadow-cartoon-sm rounded-full bg-card px-3 py-1.5 font-bold">
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="border-ink-thick shadow-cartoon-lg relative aspect-[5/4] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky via-cream to-coral/40 p-4">
            <div className="absolute inset-0 doodle-bg opacity-30" />

            <div className="absolute left-0 top-6 text-4xl opacity-80" style={{ animation: "cloud-drift 18s linear infinite" }}>☁️</div>
            <div className="absolute right-0 top-24 text-3xl opacity-70" style={{ animation: "cloud-drift 26s linear infinite reverse" }}>☁️</div>

            {["⭐", "✨", "🐾", "🌸", "💫", "🐾", "🌸", "⭐", "🧠"].map((s, i) => (
              <span
                key={i}
                className="absolute select-none"
                style={{
                  left: `${10 + (i * 11) % 80}%`,
                  top: `${15 + (i * 17) % 70}%`,
                  fontSize: `${14 + (i % 3) * 6}px`,
                  animation: `float-y ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
                }}
              >
                {s}
              </span>
            ))}

            <div className="border-ink shadow-cartoon-sm absolute left-5 top-5 rounded-2xl bg-card px-3 py-1.5 text-xs font-bold animate-float-y">
              🐾 Shiro Approved
            </div>
            <div className="border-ink shadow-cartoon-sm absolute right-5 top-5 -rotate-3 rounded-2xl bg-lemon px-3 py-1.5 text-xs font-bold animate-wobble">
              🧠 Memory Active
            </div>

            <div className="absolute inset-x-6 bottom-16 flex items-end justify-center">
              <img
                src={kamen.image}
                alt={kamen.name}
                className="w-[78%] drop-shadow-[6px_6px_0_var(--ink)] animate-float-y"
                style={{ animationDuration: "4.5s" }}
              />
            </div>

            <div className="absolute bottom-3 right-4 text-6xl animate-wobble" style={{ animationDuration: "2.4s" }}>
              🐶
            </div>
            <div className="border-ink shadow-cartoon-sm absolute bottom-5 left-5 rotate-3 rounded-2xl bg-coral px-3 py-1.5 text-xs font-bold">
              ✨ Personalized for you
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
