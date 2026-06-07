import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Profile = {
  username: string;
  password: string;
  displayName: string;
  purchased: string;
  favorite: string;
  pastIssues: { issue: string; resolution: string; date: string }[];
};

export const PROFILES: Profile[] = [
  {
    username: "kazama",
    password: "honor",
    displayName: "Kazama",
    purchased: "Action Kamen Pro 15",
    favorite: "Action Kamen Pro",
    pastIssues: [
      { issue: "Battery drains quickly during study sessions", resolution: "Enabled Honor-Saver mode, +3hr life", date: "2025-09-12" },
      { issue: "Keyboard backlight too bright at night", resolution: "Set auto-dim after 9pm", date: "2025-10-04" },
    ],
  },
  {
    username: "nene",
    password: "bunny",
    displayName: "Nene",
    purchased: "Nene-chan Studio",
    favorite: "Nene-chan Studio",
    pastIssues: [
      { issue: "Stylus pressure not smooth in sketches", resolution: "Updated Bunny pen driver v2.4", date: "2025-08-22" },
      { issue: "Color profile off on external monitor", resolution: "Applied Nene-chan vivid LUT", date: "2025-11-01" },
    ],
  },
  {
    username: "masao",
    password: "shy",
    displayName: "Masao",
    purchased: "Masao Mini",
    favorite: "Masao Mini",
    pastIssues: [
      { issue: "Laptop too heavy in my backpack", resolution: "Recommended Masao Mini upgrade path", date: "2025-07-19" },
      { issue: "Fan noise scares me at night", resolution: "Enabled Quiet Pup mode", date: "2025-10-28" },
    ],
  },
];

export type CartItem = { id: string; name: string; price: number; image: string; qty: number };
export type Order = { id: string; date: string; items: CartItem[]; total: number; status: "Delivered" | "Processing"; supportRequests: number };

type Ctx = {
  profile: Profile | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  cart: CartItem[];
  addToCart: (i: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  adOpen: boolean;
  setAdOpen: (v: boolean) => void;
  orders: Order[];
  checkout: () => Order | null;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = localStorage.getItem("kasu_user");
    if (u) {
      const p = PROFILES.find((x) => x.username === u);
      if (p) setProfile(p);
    }
    const t = (localStorage.getItem("kasu_theme") as "light" | "dark") || "light";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !profile) return;
    const saved = localStorage.getItem(`kasu_orders_${profile.username}`);
    setOrders(saved ? JSON.parse(saved) : []);
  }, [profile]);

  function persistOrders(next: Order[]) {
    setOrders(next);
    if (profile) localStorage.setItem(`kasu_orders_${profile.username}`, JSON.stringify(next));
  }

  function login(u: string, p: string) {
    const f = PROFILES.find((x) => x.username === u.toLowerCase().trim() && x.password === p);
    if (f) {
      setProfile(f);
      localStorage.setItem("kasu_user", f.username);
      return true;
    }
    return false;
  }
  function logout() {
    setProfile(null);
    setCart([]);
    setOrders([]);
    localStorage.removeItem("kasu_user");
  }
  function toggleTheme() {
    const nx = theme === "light" ? "dark" : "light";
    setTheme(nx);
    localStorage.setItem("kasu_theme", nx);
    document.documentElement.classList.toggle("dark", nx === "dark");
  }
  function addToCart(i: Omit<CartItem, "qty">) {
    setCart((c) => {
      const ex = c.find((x) => x.id === i.id);
      if (ex) return c.map((x) => (x.id === i.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...i, qty: 1 }];
    });
    setCartOpen(true);
  }
  function removeFromCart(id: string) {
    setCart((c) => c.filter((x) => x.id !== id));
  }
  function setQty(id: string, qty: number) {
    if (qty <= 0) return removeFromCart(id);
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));
  }
  function checkout(): Order | null {
    if (cart.length === 0) return null;
    const order: Order = {
      id: "ORD-" + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString().slice(0, 10),
      items: cart,
      total: cart.reduce((a, b) => a + b.price * b.qty, 0),
      status: "Processing",
      supportRequests: 0,
    };
    persistOrders([order, ...orders]);
    setCart([]);
    return order;
  }

  return (
    <AppCtx.Provider
      value={{ profile, login, logout, theme, toggleTheme, cart, addToCart, removeFromCart, setQty, cartOpen, setCartOpen, adOpen, setAdOpen, orders, checkout }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
}
