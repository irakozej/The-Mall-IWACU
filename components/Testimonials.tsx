"use client";

import { Star, Quote } from "lucide-react";
import testimonialsData from "@/data/testimonials.json";
import { useT } from "@/lib/i18n";

type Testimonial = {
  name: string;
  role?: string;
  quote: string;
  rating?: number;
  featured?: boolean;
};

const items = (testimonialsData as { items: Testimonial[] }).items;

export default function Testimonials() {
  const t = useT();
  // Featured first, then the rest, capped at 6 so the section stays light.
  const ordered = [...items].sort(
    (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
  ).slice(0, 6);

  if (ordered.length === 0) return null;

  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("testimonials.kicker")}
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight max-w-xl">
              {t("testimonials.heading")}
            </h2>
          </div>
          <p className="md:max-w-xs text-sm text-ink-soft">
            {t("testimonials.intro")}
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ordered.map((t, i) => (
            <li
              key={`${t.name}-${i}`}
              className="relative bg-cream-warm border border-ink/10 p-6 sm:p-7 flex flex-col"
            >
              <Quote
                size={24}
                strokeWidth={1.6}
                className="text-gold/70 mb-3"
                aria-hidden
              />
              <p className="font-display text-lg sm:text-xl text-forest leading-snug">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-auto pt-5 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-ink">{t.name}</div>
                  {t.role ? (
                    <div className="text-xs text-ink-mute">{t.role}</div>
                  ) : null}
                </div>
                {t.rating ? (
                  <div className="flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={14}
                        className={
                          idx < (t.rating ?? 0)
                            ? "fill-gold text-gold"
                            : "text-ink/20"
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              {t.featured ? (
                <span className="absolute -left-2 top-6 w-1 h-10 bg-gold" aria-hidden />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
