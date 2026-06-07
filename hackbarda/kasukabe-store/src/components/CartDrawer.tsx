import { useState } from "react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { formatINR } from "@/lib/laptops";
import { recordPurchase } from "@/lib/api";

export function CartDrawer() {
  const { profile, cart, cartOpen, setCartOpen, setQty, removeFromCart, checkout } = useApp();
  const [success, setSuccess] = useState<{ id: string; total: number } | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const total = cart.reduce((a, b) => a + b.price * b.qty, 0);

  async function doCheckout() {
    if (checkingOut) return;
    const items = cart.map((it) => ({ name: it.name, qty: it.qty, price: it.price }));
    const o = checkout();
    if (!o) return;

    setCheckingOut(true);
    setSuccess({ id: o.id, total: o.total });

    if (profile) {
      try {
        await recordPurchase({
          customer_id: profile.username,
          order_id: o.id,
          items: items.map((it) => ({ name: it.name, qty: it.qty })),
          total: o.total,
        });
        toast.success("🎉 Purchase successful! Shiro saved it to memory.");
      } catch {
        toast.success("🎉 Purchase successful!");
        toast.error("Couldn't save to Shiro memory — chat may not remember this purchase.");
      }
    } else {
      toast.success("🎉 Purchase successful! Log in so Shiro can remember your purchases.");
    }

    setCheckingOut(false);
  }

  if (!cartOpen && !success) return null;
  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-foreground/40 backdrop-blur-sm" onClick={() => { setCartOpen(false); setSuccess(null); }} />
      <aside className="border-ink-thick flex w-[min(420px,92vw)] flex-col border-l-[4px] bg-card animate-[slide-in-right_0.3s_ease-out]">
        <div className="border-ink-thick flex items-center justify-between border-b-[3px] bg-lemon px-4 py-3">
          <h3 className="font-bold">🛒 Your Cart</h3>
          <button onClick={() => { setCartOpen(false); setSuccess(null); }} className="border-ink flex h-8 w-8 items-center justify-center rounded-full bg-card">
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center animate-[fade-in_0.4s_ease-out]">
            <div className="text-6xl animate-wobble">🎉</div>
            <h3 className="text-2xl font-bold">Purchase Successful!</h3>
            <p className="text-sm text-muted-foreground">Thank you for shopping at Kasukabe Laptop Store.</p>
            <div className="border-ink rounded-2xl bg-mint px-4 py-2 text-sm font-bold">🧠 Shiro saved your purchase to memory</div>
            <div className="text-xs text-muted-foreground">Order #{success.id}</div>
            <div className="font-bold">{formatINR(success.total)}</div>
            <button
              onClick={() => { setSuccess(null); setCartOpen(false); document.getElementById("orders")?.scrollIntoView({ behavior: "smooth" }); }}
              className="border-ink shadow-cartoon mt-3 rounded-full bg-primary px-6 py-2.5 font-bold"
            >
              View Order History →
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="mb-3 text-6xl animate-wobble">🐶</div>
                  Cart is empty. Add a laptop!
                </div>
              ) : (
                cart.map((it) => (
                  <div key={it.id} className="border-ink flex gap-3 rounded-2xl bg-cream p-3">
                    <img src={it.image} alt={it.name} className="border-ink h-16 w-20 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-bold">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{formatINR(it.price)}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => setQty(it.id, it.qty - 1)} className="border-ink flex h-6 w-6 items-center justify-center rounded-full bg-card">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold">{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.qty + 1)} className="border-ink flex h-6 w-6 items-center justify-center rounded-full bg-card">
                          <Plus className="h-3 w-3" />
                        </button>
                        <button onClick={() => removeFromCart(it.id)} className="ml-auto border-ink flex h-6 w-6 items-center justify-center rounded-full bg-coral">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-ink-thick border-t-[3px] bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold">{formatINR(total)}</span>
              </div>
              <button
                onClick={doCheckout}
                disabled={cart.length === 0 || checkingOut}
                className="border-ink shadow-cartoon w-full rounded-full bg-primary py-3 font-bold disabled:opacity-50"
              >
                {checkingOut ? "Saving to memory..." : "Checkout 🐾"}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
