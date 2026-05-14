"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { unsplashSrc } from "@/lib/site";
import { useT } from "@/lib/i18n";

const scenes = [
  {
    id: "kitchen",
    src: "https://images.unsplash.com/photo-1687365762572-b418d588c225",
    alt: "Charcoal-grilled brochettes on the kitchen grill",
    href: "/menu#cat-kitchen",
  },
  {
    id: "bar",
    src: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34",
    alt: "Warm bar lights over a wooden bar counter",
    href: "/menu#cat-bar",
  },
  {
    id: "spa",
    src: "https://images.unsplash.com/photo-1696841212541-449ca29397cc",
    alt: "Hot stone treatment during a relaxing spa session",
    href: "/book",
  },
] as const;

export default function LifestyleStrip() {
  const t = useT();
  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" />
              {t("lifestyle.kicker")}
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight max-w-xl">
              {t("lifestyle.heading")}
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden md:inline-flex items-center gap-2 text-sm text-forest hover:text-gold-deep transition-colors"
          >
            {t("lifestyle.cta")} <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {scenes.map((s, i) => (
            <Link
              key={s.id}
              href={s.href}
              className="group relative block aspect-[4/5] overflow-hidden bg-forest/10 rounded-2xl"
            >
              <Image
                src={unsplashSrc(s.src, 900, 72)}
                alt={s.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                priority={i === 0}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,42,31,0) 35%, rgba(15,42,31,0.75) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-cream">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/90">
                  0{i + 1} · {t(`lifestyle.scenes.${s.id}.label`)}
                </p>
                <p className="mt-1 font-display text-xl sm:text-2xl leading-tight">
                  {t(`lifestyle.scenes.${s.id}.caption`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
