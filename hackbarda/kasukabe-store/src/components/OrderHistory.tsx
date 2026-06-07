import { useApp } from "@/lib/store";
import { formatINR } from "@/lib/laptops";

export function OrderHistory() {
  const { orders, profile } = useApp();
  return (
    <section id="orders" className="relative z-10 mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 text-center">
        <span className="border-ink shadow-cartoon-sm rounded-full bg-sky px-4 py-1 text-sm font-bold">📦 Order History</span>
        <h2 className="mt-3 text-4xl font-bold md:text-5xl">Your purchases, remembered</h2>
        {profile && <p className="mt-2 text-muted-foreground">Shiro keeps a paw on every order for {profile.displayName}.</p>}
      </div>

      {orders.length === 0 ? (
        <div className="border-ink shadow-cartoon mx-auto max-w-md rounded-3xl bg-card p-8 text-center">
          <div className="mb-3 text-5xl animate-wobble">🐾</div>
          <p className="font-bold">No orders yet</p>
          <p className="text-sm text-muted-foreground">Once you checkout, your history will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((o) => (
            <div key={o.id} className="border-ink shadow-cartoon rounded-3xl bg-card p-5 transition-transform hover:-translate-y-1">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">{o.date}</div>
                  <div className="font-bold">Order #{o.id}</div>
                </div>
                <span className="border-ink rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold">{o.status}</span>
              </div>
              <div className="space-y-2">
                {o.items.map((it) => (
                  <div key={it.id} className="border-ink flex items-center gap-3 rounded-2xl bg-cream p-2">
                    <img src={it.image} alt={it.name} className="border-ink h-12 w-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-bold">{it.name}</div>
                      <div className="text-xs text-muted-foreground">Qty {it.qty} · {formatINR(it.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-foreground/20 pt-3 text-sm">
                <span>🧠 Support requests: <b>{o.supportRequests}</b></span>
                <span className="font-bold">{formatINR(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
