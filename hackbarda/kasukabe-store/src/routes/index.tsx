import { createFileRoute } from "@tanstack/react-router";
import { AppProvider, useApp } from "@/lib/store";
import { Hero } from "@/components/Hero";
import { LaptopGrid } from "@/components/LaptopGrid";
import { ShiroChat } from "@/components/ShiroChat";
import { Nav } from "@/components/Nav";
import { Login } from "@/components/Login";
import { SpecsSection } from "@/components/SpecsSection";
import { OrderHistory } from "@/components/OrderHistory";
import { SupportSection } from "@/components/SupportSection";
import { CartDrawer } from "@/components/CartDrawer";
import { AdModal } from "@/components/AdModal";
import { AmbientFX } from "@/components/AmbientFX";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kasukabe Laptop Store — Smart laptops, smarter memories" },
      { name: "description", content: "AI customer support that remembers every customer. Powered by Shiro — the smart memory pup." },
    ],
  }),
  component: () => (
    <AppProvider>
      <Shell />
    </AppProvider>
  ),
});

function Shell() {
  const { profile } = useApp();
  if (!profile) return (<><Login /><Toaster /></>);
  return (
    <main className="relative min-h-screen">
      <AmbientFX />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <LaptopGrid />
        <SpecsSection />
        <OrderHistory />
        <SupportSection />
        <footer className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground">
          Made with 🐾 in Kasukabe · © {new Date().getFullYear()} Kasukabe Laptop Store
        </footer>
      </div>
      <ShiroChat />
      <CartDrawer />
      <AdModal />
      <Toaster />
    </main>
  );
}
