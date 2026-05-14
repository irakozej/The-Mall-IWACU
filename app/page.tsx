"use client";

import Link from "next/link";
import {
  ShoppingBasket,
  Wine,
  ChefHat,
  Sparkles,
  Clock,
  MapPin,
  Phone,
  Heart,
  Award,
  Sprout,
} from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ServiceCard from "@/components/ServiceCard";
import MapEmbed from "@/components/MapEmbed";
import LifestyleStrip from "@/components/LifestyleStrip";
import Testimonials from "@/components/Testimonials";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";

const ICON_PROPS = { size: 20, strokeWidth: 1.6 };

const SERVICE_IDS = ["groceries", "bar", "kitchen", "spa"] as const;
const SERVICE_ICONS: Record<(typeof SERVICE_IDS)[number], React.ReactNode> = {
  groceries: <ShoppingBasket {...ICON_PROPS} />,
  bar: <Wine {...ICON_PROPS} />,
  kitchen: <ChefHat {...ICON_PROPS} />,
  spa: <Sparkles {...ICON_PROPS} />,
};
const SERVICE_HREFS: Record<(typeof SERVICE_IDS)[number], string> = {
  groceries: "/about#groceries",
  bar: "/menu#cat-bar",
  kitchen: "/menu#cat-kitchen",
  spa: "/book",
};

const VALUE_IDS = ["community", "quality", "convenience", "location"] as const;
const VALUE_ICONS: Record<(typeof VALUE_IDS)[number], typeof Heart> = {
  community: Heart,
  quality: Award,
  convenience: Sprout,
  location: MapPin,
};

export default function HomePage() {
  const t = useT();

  return (
    <>
      <JsonLd variant="home" />
      <HeroSection />

      {/* Services */}
      <section id="services" className="relative bg-cream py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
                <span className="rule" />
                {t("services.kicker")}
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight max-w-2xl">
                {t("services.heading")}
              </h2>
            </div>
            <p className="md:max-w-sm text-sm text-ink-soft">
              {t("services.intro")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {SERVICE_IDS.map((id, i) => (
              <ServiceCard
                key={id}
                index={i + 1}
                icon={SERVICE_ICONS[id]}
                title={t(`services.items.${id}.title`)}
                description={t(`services.items.${id}.description`)}
                href={SERVICE_HREFS[id]}
                cta={t(`services.items.${id}.cta`)}
              />
            ))}
          </div>
        </div>
      </section>

      <LifestyleStrip />

      <Testimonials />

      {/* Why us */}
      <section className="relative bg-cream-warm py-20 sm:py-28 grain">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("whyUs.kicker")}
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl text-forest leading-[1.05]">
              {t("whyUs.heading")}
            </h2>
            <p className="mt-6 text-ink-soft leading-relaxed max-w-md">
              {t("whyUs.lead")}
            </p>
          </div>

          <div className="md:col-span-7 grid sm:grid-cols-2 gap-x-8 gap-y-10">
            {VALUE_IDS.map((id, i) => {
              const Icon = VALUE_ICONS[id];
              return (
                <div key={id}>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-ink-mute">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <Icon size={20} className="text-gold mt-1 shrink-0" />
                    <div>
                      <h3 className="font-display text-2xl text-forest leading-tight">
                        {t(`whyUs.values.${id}.title`)}
                      </h3>
                      <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                        {t(`whyUs.values.${id}.body`)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hours + Map */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("hours.kicker")}
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight">
              {t("hours.heading")}
            </h2>

            <div className="mt-8 bg-cream-warm border border-ink/10 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-forest">
                <Clock size={18} className="text-gold" />
                <span className="text-[11px] tracking-[0.3em] uppercase">{t("hours.when")}</span>
              </div>
              <ul className="mt-5 divide-y divide-ink/10">
                {site.hours.map((h) => (
                  <li
                    key={h.day}
                    className="py-3 flex items-baseline justify-between gap-4 font-sans"
                  >
                    <span className="text-ink">{h.day}</span>
                    <span className="font-display text-forest text-lg tabular-nums">
                      {h.time}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-start gap-3 text-sm text-ink-soft">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <p>
                  {site.address.line1}, {site.address.line2}
                </p>
              </div>

              <div className="mt-5 flex items-start gap-3 text-sm text-ink-soft">
                <Phone size={16} className="text-gold mt-0.5 shrink-0" />
                <a
                  href={`tel:${site.phoneDigits}`}
                  className="hover:text-gold-deep transition-colors tabular-nums"
                >
                  {site.phone}
                </a>
              </div>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {site.amenities.map((a) => (
                  <li
                    key={a}
                    className="text-[11px] tracking-wide border border-forest/15 text-forest px-2.5 py-1"
                  >
                    {a}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-forest text-cream px-5 py-2.5 text-sm hover:bg-forest-deep transition-colors"
                >
                  {t("common.seeFullMenu")}
                </Link>
                <a
                  href={site.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-forest/40 text-forest px-5 py-2.5 text-sm hover:bg-forest hover:text-cream transition-colors"
                >
                  {t("common.getDirections")}
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("map.kicker")}
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight">
              {t("map.heading")}
            </h2>
            <div className="mt-8 h-[420px]">
              <MapEmbed className="h-full" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
