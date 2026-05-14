"use client";

import Image from "next/image";
import Link from "next/link";
import { Quote, Heart, Sprout, ChefHat, Smile } from "lucide-react";
import ImigongoPattern from "@/components/ImigongoPattern";
import { unsplashSrc } from "@/lib/site";
import { useT } from "@/lib/i18n";

const VALUE_IDS = ["community", "quality", "convenience", "hospitality"] as const;
const VALUE_ICONS = {
  community: Heart,
  quality: Sprout,
  convenience: Smile,
  hospitality: ChefHat,
};

export default function AboutPage() {
  const t = useT();
  return (
    <>
      <section className="relative bg-forest-deep text-cream overflow-hidden">
        <ImigongoPattern className="absolute -right-24 -top-24 w-[480px] h-[480px] opacity-90" />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            {t("about.kicker")}
          </p>
          <h1 className="mt-3 font-display text-5xl sm:text-7xl leading-[0.95] max-w-3xl">
            {t("about.heading")}
          </h1>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="text-gold mb-4">
              <Quote size={36} strokeWidth={1.4} />
            </div>
            <p className="font-display text-2xl sm:text-3xl leading-snug text-forest">
              {t("about.pullQuote")}
            </p>
            <p className="mt-5 text-ink-soft leading-relaxed">
              {t("about.pullSupport")}
            </p>
          </div>

          <div className="md:col-span-7 md:border-l md:border-ink/10 md:pl-10">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("about.storyKicker")}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              {t("about.storyHeading")}
            </h2>
            <div className="mt-6 space-y-4 text-ink-soft leading-relaxed">
              <p>{t("about.story1")}</p>
              <p>{t("about.story2")}</p>
              <p>{t("about.story3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-warm grain py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
            <span className="rule" /> {t("about.valuesKicker")}
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight max-w-2xl">
            {t("about.valuesHeading")}
          </h2>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
            {VALUE_IDS.map((id, i) => {
              const Icon = VALUE_ICONS[id];
              return (
                <div key={id}>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-ink-mute">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <Icon size={22} className="text-gold mt-3" />
                  <h3 className="mt-3 font-display text-2xl text-forest">{t(`about.values.${id}.title`)}</h3>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">{t(`about.values.${id}.body`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Owner */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-forest text-cream rounded-2xl">
              <Image
                src={unsplashSrc("photo-1593708659671-595be1c95128", 1100, 72)}
                alt="Vegetables and skewers cooking on the grill"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,42,31,0.10) 30%, rgba(15,42,31,0.85) 100%)",
                }}
              />
              <div className="relative h-full flex items-end p-6 sm:p-8">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gold/95">
                    {t("about.ownerLabel")}
                  </p>
                  <p className="mt-2 font-display text-3xl">{t("about.ownerName")}</p>
                  <p className="mt-2 text-cream/85 text-sm">{t("about.ownerLocation")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("about.ownerNoteKicker")}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              {t("about.ownerNoteHeading")}
            </h2>
            <p className="mt-5 text-ink-soft leading-relaxed">
              {t("about.ownerNote")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-forest text-cream px-5 py-2.5 text-sm hover:bg-forest-deep transition-colors"
              >
                {t("about.browseMenu")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-forest/40 text-forest px-5 py-2.5 text-sm hover:bg-forest hover:text-cream transition-colors"
              >
                {t("about.sayHello")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
