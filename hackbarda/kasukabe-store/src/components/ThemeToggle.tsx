import { Moon, Sun } from "lucide-react";
import { useApp } from "@/lib/store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="border-ink shadow-cartoon-sm flex h-10 w-10 items-center justify-center rounded-full bg-card transition-transform hover:rotate-12"
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
