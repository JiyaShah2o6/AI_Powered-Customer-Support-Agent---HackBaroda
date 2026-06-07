import { LAPTOPS, formatINR } from "@/lib/laptops";

export function SpecsSection() {
  return (
    <section id="specs" className="relative z-10 mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 text-center">
        <span className="border-ink shadow-cartoon-sm rounded-full bg-lemon px-4 py-1 text-sm font-bold">📋 Compare</span>
        <h2 className="mt-3 text-4xl font-bold md:text-5xl">Specs side-by-side</h2>
        <p className="mt-2 text-muted-foreground">All eight pups in a single comfy table.</p>
      </div>
      <div className="border-ink shadow-cartoon overflow-x-auto rounded-3xl bg-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-sky">
            <tr className="text-left">
              {["Laptop", "Processor", "RAM", "Storage", "Character", "Best For", "Price"].map((h) => (
                <th key={h} className="border-b-[3px] border-foreground px-4 py-3 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LAPTOPS.map((l) => (
              <tr key={l.id} className="border-b-2 border-foreground/20 transition-colors hover:bg-cream">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={l.image} alt={l.name} className="border-ink h-12 w-16 rounded-lg object-cover" />
                    <span className="font-bold">{l.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{l.cpu}</td>
                <td className="px-4 py-3">{l.ram}</td>
                <td className="px-4 py-3">{l.storage}</td>
                <td className="px-4 py-3">{l.character}</td>
                <td className="px-4 py-3">{l.bestFor}</td>
                <td className="px-4 py-3 font-bold">{formatINR(l.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
