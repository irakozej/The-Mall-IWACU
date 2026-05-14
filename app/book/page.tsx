"use client";

import BookingForm from "@/components/BookingForm";
import ImigongoPattern from "@/components/ImigongoPattern";
import { useT } from "@/lib/i18n";

export default function BookPage() {
  const t = useT();
  return (
    <>
      <section className="relative bg-forest-deep text-cream overflow-hidden">
        <ImigongoPattern className="absolute -right-20 -top-20 w-[420px] h-[420px] opacity-80" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            {t("book.kicker")}
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-7xl leading-[0.95]">
            {t("book.title")}
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            {t("book.subtitle")}
          </p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <BookingForm />
        </div>
      </section>
    </>
  );
}
