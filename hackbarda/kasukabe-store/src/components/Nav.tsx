import { ShoppingBag, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useApp } from "@/lib/store";

const links = [
  { id: "shop", label: "Shop" },
  { id: "specs", label: "Specs" },
  { id: "orders", label: "Orders" },
  { id: "support", label: "Support" },
];

export function Nav() {
  const { cart, setCartOpen, profile, logout } = useApp();
  const count = cart.reduce((a, b) => a + b.qty, 0);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="sticky top-0 z-40 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 backdrop-blur-sm">
      <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <Logo />
      </a>
      <div className="hidden gap-1 md:flex">
        {links.map((l) => (
          <button
            key={l.id}
            onClick={() => scrollTo(l.id)}
            className="rounded-full px-3 py-1.5 text-sm font-bold transition-colors hover:bg-card"
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {profile && (
          <div className="border-ink shadow-cartoon-sm hidden items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-xs font-bold sm:flex">
            🐾 {profile.displayName}
          </div>
        )}
        <ThemeToggle />
        <button
          onClick={() => setCartOpen(true)}
          className="border-ink shadow-cartoon-sm relative flex items-center gap-2 rounded-full bg-lemon px-4 py-2 text-sm font-bold"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="border-ink ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px]">
              {count}
            </span>
          )}
        </button>
        {profile && (
          <button
            onClick={logout}
            aria-label="Logout"
            title="Logout"
            className="border-ink shadow-cartoon-sm flex h-10 items-center gap-1.5 rounded-full bg-card px-3 hover:bg-coral"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden text-xs font-bold sm:inline">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}
