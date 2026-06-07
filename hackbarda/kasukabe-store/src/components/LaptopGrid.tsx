import { Cpu, HardDrive, Zap, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LAPTOPS, formatINR, type Laptop } from "@/lib/laptops";
import { useApp } from "@/lib/store";

const RECS: Record<string, string[]> = {
  kazama: ["kazama", "shiro"],
  nene: ["nene"],
  masao: ["masao", "shiro"],
};

export function LaptopGrid() {
  const { addToCart, profile } = useApp();
  const recIds = profile ? RECS[profile.username] ?? [] : [];

  function add(l: Laptop) {
    addToCart({ id: l.id, name: l.name, price: l.price, image: l.image });
    toast.success("🐾 Added to cart successfully!");
  }

  return (
    <section id="shop" className="relative z-10 mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <span className="border-ink shadow-cartoon-sm rounded-full bg-coral px-4 py-1 text-sm font-bold">
          ✨ Today's Lineup
        </span>
        <h2 className="text-4xl font-bold md:text-5xl">Pick your trusty sidekick laptop</h2>
        <p className="max-w-xl text-muted-foreground">
          Eight cheerful machines, hand-picked from the Kasukabe shelves — each remembered by Shiro. 🐶
        </p>
      </div>

      {profile && recIds.length > 0 && (
        <div className="border-ink shadow-cartoon mb-8 rounded-3xl bg-mint/60 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4" /> 🧠 Shiro's Picks for {profile.displayName}
          </div>
          <div className="flex flex-wrap gap-2">
            {recIds.map((id) => {
              const l = LAPTOPS.find((x) => x.id === id);
              if (!l) return null;
              return (
                <button
                  key={id}
                  onClick={() => document.getElementById("shop-" + id)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className="border-ink shadow-cartoon-sm rounded-full bg-card px-3 py-1.5 text-xs font-bold hover:-translate-y-0.5"
                >
                  ⭐ {l.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {LAPTOPS.map((l, i) => {
          const fav = profile?.favorite === l.name;
          const rec = recIds.includes(l.id);
          return (
            <article
              id={"shop-" + l.id}
              key={l.id}
              className="border-ink shadow-cartoon group relative rounded-3xl bg-card p-5 transition-all duration-300 hover:-translate-y-2 hover:rotate-[-1deg] hover:shadow-[10px_10px_0_0_var(--ink)]"
            >
              {fav && (
                <div className="border-ink shadow-cartoon-sm absolute -top-3 left-4 z-10 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold animate-wobble">
                  ⭐ Your Favorite
                </div>
              )}
              {rec && !fav && (
                <div className="border-ink shadow-cartoon-sm absolute -top-3 left-4 z-10 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold">
                  🧠 Shiro Picks
                </div>
              )}
              <div className={`border-ink relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-2xl ${l.color}`}>
                <div className="absolute inset-0 doodle-bg opacity-30" />
                {["✨", "⭐", "🌸"].map((s, k) => (
                  <span
                    key={k}
                    className="absolute select-none text-xs opacity-70"
                    style={{
                      left: `${15 + k * 30}%`,
                      top: `${10 + k * 18}%`,
                      animation: `float-y ${2.5 + k}s ease-in-out ${k * 0.4}s infinite`,
                    }}
                  >
                    {s}
                  </span>
                ))}
                <img
                  src={l.image}
                  alt={l.name}
                  loading="lazy"
                  className="relative max-h-[90%] max-w-[92%] object-contain drop-shadow-[4px_4px_0_var(--ink)] transition-transform duration-500 group-hover:scale-110"
                  style={{ animation: `float-y ${4 + (i % 3)}s ease-in-out ${i * 0.2}s infinite` }}
                />
              </div>

              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold leading-tight">{l.name}</h3>
                <div className="flex shrink-0 items-center gap-0.5">
                  {Array.from({ length: l.rating }).map((_, k) => (
                    <Star key={k} className="h-3.5 w-3.5 fill-foreground text-foreground" />
                  ))}
                </div>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{l.tagline}</p>

              <div className="mb-4 grid grid-cols-3 gap-1.5 text-xs">
                <Spec icon={<Cpu className="h-3 w-3" />} label={l.cpu} />
                <Spec icon={<HardDrive className="h-3 w-3" />} label={l.ram} />
                <Spec icon={<Zap className="h-3 w-3" />} label="Fast" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">{formatINR(l.price)}</span>
                <button
                  onClick={() => add(l)}
                  className="border-ink shadow-cartoon-sm rounded-full bg-primary px-4 py-1.5 text-sm font-bold transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  Add 🛒
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="border-ink flex items-center justify-center gap-1 rounded-lg bg-muted px-1.5 py-1 font-semibold">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}
