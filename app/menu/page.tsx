"use client";

import { menu } from "@/lib/menu";
import MenuTabs from "@/components/MenuTabs";
import JsonLd from "@/components/JsonLd";
import { useT } from "@/lib/i18n";

export default function MenuPage() {
  const t = useT();
  return (
    <>
      <JsonLd variant="menu" />
      <section className="bg-forest-deep text-cream relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-90">
          <div className="absolute -right-8 -top-8 w-72 h-72 bg-gold/10 blur-3xl rounded-full" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            {t("menu.kicker")}
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-7xl leading-[0.95]">
            {t("menu.title")}
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            {t("menu.subtitle")}
          </p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <MenuTabs data={menu} />
    </>
  );
}
