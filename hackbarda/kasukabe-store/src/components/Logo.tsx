export function Logo({ size = 44 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="border-ink shadow-cartoon-sm relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky via-cream to-coral animate-wobble"
        style={{ width: size, height: size }}
      >
        <span className="absolute -top-1 -right-1 text-xs animate-float-y">🐾</span>
        <span className="absolute -bottom-1 -left-1 text-xs">🌸</span>
        <span className="text-xl">🐶</span>
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-bold tracking-tight">
          Kasukabe<span className="text-coral">•</span>Pup
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Laptop Store 🐾</div>
      </div>
    </div>
  );
}
