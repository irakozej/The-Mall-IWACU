"use client";

import { Globe } from "lucide-react";
import { locales, useLocale, type Locale } from "@/lib/i18n";

type Variant = "compact" | "stacked";

export default function LanguageSwitcher({
  variant = "compact",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const { locale, setLocale, t } = useLocale();

  if (variant === "stacked") {
    return (
      <div className={["flex gap-2", className].filter(Boolean).join(" ")}>
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            className={[
              "px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors",
              locale === l
                ? "bg-forest text-cream"
                : "border border-ink/15 text-ink-soft hover:text-forest",
            ].join(" ")}
          >
            {short(l)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={[
        "inline-flex items-center gap-1 text-[11px] tracking-[0.2em] uppercase",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={t("common.language")}
    >
      <Globe size={13} className="text-gold mr-1" aria-hidden />
      {locales.map((l, i) => (
        <span key={l} className="contents">
          <button
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            className={[
              "px-1.5 py-1 transition-colors",
              locale === l ? "text-forest font-medium" : "text-ink-mute hover:text-forest",
            ].join(" ")}
          >
            {short(l)}
          </button>
          {i < locales.length - 1 ? (
            <span className="text-ink/25" aria-hidden>
              ·
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

function short(l: Locale): string {
  return l.toUpperCase();
}
