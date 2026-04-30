import type { Metadata } from "next";
import { menu } from "@/lib/menu";
import MenuTabs from "@/components/MenuTabs";

export const metadata: Metadata = {
  title: "Menu — Eat, Drink, Spa",
  description:
    "Full menu for The Mall IWACU — Kitchen, Bar, and Massage & Steam. Prices in RWF, served daily in Kabeza, Kicukiro, Kigali.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <>
      {/* Compact menu hero — typographic, fast */}
      <section className="bg-forest-deep text-cream relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-90">
          <div className="absolute -right-8 -top-8 w-72 h-72 bg-gold/10 blur-3xl rounded-full" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            The Mall IWACU
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-7xl leading-[0.95]">
            Menu.
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            Tap a category. Search a dish. Prices in RWF.
          </p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <MenuTabs data={menu} />
    </>
  );
}
