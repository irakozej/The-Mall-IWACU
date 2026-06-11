"use client";

import StaffDashboard from "@/components/StaffDashboard";
import ImigongoPattern from "@/components/ImigongoPattern";
import { useT } from "@/lib/i18n";

export default function StaffPage() {
  const t = useT();
  return (
    <>
      <section className="relative bg-forest-deep text-cream overflow-hidden">
        <ImigongoPattern className="absolute -right-20 -top-20 w-[420px] h-[420px] opacity-80" />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            {t("staff.kicker")}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-6xl leading-[0.95]">
            {t("staff.heading")}
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            {t("staff.intro")}
          </p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <StaffDashboard />
        </div>
      </section>
    </>
  );
}
