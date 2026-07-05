"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { menu } from "@/lib/menu";
import MenuTabs from "@/components/MenuTabs";
import ImigongoPattern from "@/components/ImigongoPattern";
import { useT } from "@/lib/i18n";

// The spa price list lives in menu.json alongside food & drink, but renders
// on its own page — /menu shows only bar + kitchen.
const spaOnly = {
  ...menu,
  categories: menu.categories.filter((c) => c.id === "spa"),
};

export default function SpaPage() {
  const t = useT();
  return (
    <>
      <section className="relative bg-forest-deep text-cream overflow-hidden">
        <ImigongoPattern className="absolute -right-20 -top-20 w-[420px] h-[420px] opacity-80" />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            {t("spaPage.kicker")}
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-7xl leading-[0.95]">
            {t("spaPage.title")}
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            {t("spaPage.subtitle")}
          </p>
          <Link
            href="/book"
            className="group mt-7 inline-flex w-full sm:w-auto items-center justify-center gap-2.5 bg-gold text-forest-deep font-semibold px-10 py-4 text-base sm:text-lg shadow-lg shadow-gold/20 hover:bg-gold-soft transition-colors"
          >
            {t("menu.bookCta")}
            <ArrowUpRight
              size={20}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <MenuTabs data={spaOnly} />

      {/* Bottom call-to-action — catches users who scrolled the full list. */}
      <section className="bg-forest-deep text-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl leading-tight">
            {t("spaPage.ctaHeading")}
          </h2>
          <Link
            href="/book"
            className="group mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2.5 bg-gold text-forest-deep font-semibold px-10 py-4 text-base sm:text-lg hover:bg-gold-soft transition-colors"
          >
            {t("menu.bookCta")}
            <ArrowUpRight
              size={20}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
