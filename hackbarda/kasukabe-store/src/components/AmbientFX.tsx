import { useMemo } from "react";

type Piece = { left: number; delay: number; dur: number; size: number; kind: string };

const KINDS = ["🌸", "⭐", "🐾", "☁️", "✨", "🌸", "🐾"];

export function AmbientFX({ density = 18 }: { density?: number }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: density }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 12,
        dur: 12 + Math.random() * 14,
        size: 14 + Math.random() * 18,
        kind: KINDS[i % KINDS.length],
      })),
    [density],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute -top-10 select-none opacity-70 will-change-transform"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `petal-fall ${p.dur}s linear ${p.delay}s infinite`,
          }}
        >
          {p.kind}
        </span>
      ))}
    </div>
  );
}
