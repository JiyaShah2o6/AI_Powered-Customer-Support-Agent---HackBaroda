import { useState } from "react";
import { useApp } from "@/lib/store";
import { Logo } from "./Logo";

export function Login() {
  const { login } = useApp();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(u, p)) setErr("Hmm, Shiro didn't recognize that. Try again!");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[5%] top-[10%] text-5xl opacity-70" style={{ animation: "cloud-drift 22s linear infinite" }}>☁️</div>
        <div className="absolute right-[8%] top-[20%] text-4xl opacity-70" style={{ animation: "cloud-drift 30s linear infinite reverse" }}>☁️</div>
        {["🌸", "🐾", "⭐", "✨", "🌸", "🐾", "🌸", "⭐"].map((s, i) => (
          <span
            key={i}
            className="absolute -top-10 select-none text-2xl opacity-80"
            style={{ left: `${i * 12 + 4}%`, animation: `petal-fall ${10 + (i % 4) * 3}s linear ${i * 0.5}s infinite` }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-10">
        <div className="mb-6"><Logo size={64} /></div>

        <form onSubmit={submit} className="border-ink-thick shadow-cartoon-lg w-full rounded-3xl bg-card p-6">
          <div className="mb-5 text-center">
            <div className="text-5xl animate-wobble">🐶</div>
            <h1 className="mt-2 text-2xl font-bold">Welcome to Kasukabe</h1>
            <p className="text-sm text-muted-foreground">Sign in so Shiro can remember you.</p>
          </div>

          <label className="mb-3 block">
            <span className="text-xs font-bold uppercase">Username</span>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              className="border-ink shadow-cartoon-sm mt-1 w-full rounded-2xl bg-background px-4 py-2 font-bold outline-none"
              placeholder="Username"
              autoFocus
            />
          </label>
          <label className="mb-4 block">
            <span className="text-xs font-bold uppercase">Password</span>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              className="border-ink shadow-cartoon-sm mt-1 w-full rounded-2xl bg-background px-4 py-2 font-bold outline-none"
              placeholder="••••••"
            />
          </label>

          {err && <div className="border-ink mb-3 rounded-xl bg-coral px-3 py-2 text-xs font-bold">{err}</div>}

          <button type="submit" className="border-ink shadow-cartoon w-full rounded-full bg-primary py-3 font-bold">
            Login 🐾
          </button>
        </form>
      </div>
    </div>
  );
}
