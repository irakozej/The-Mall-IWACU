"use client";

import type { MenuItem } from "@/lib/menu";
import { formatPrice } from "@/lib/menu";
import { useT } from "@/lib/i18n";

type Props = {
  item: MenuItem;
  currency: string;
};

export default function MenuCard({ item, currency }: Props) {
  const t = useT();
  const hasPrice = typeof item.price === "number";

  return (
    <li
      className={[
        "py-4 sm:py-5 first:pt-0 last:pb-0 border-b last:border-b-0 border-ink/10",
        item.featured ? "relative" : "",
      ].join(" ")}
    >
      {item.featured ? (
        <span className="absolute -left-3 top-5 w-1 h-8 bg-gold" aria-hidden />
      ) : null}

      <div className="leader">
        <h3 className="leader-name font-display text-lg sm:text-xl text-forest leading-tight">
          {item.name}
          {item.featured ? (
            <span className="ml-2 text-[10px] tracking-[0.25em] uppercase align-middle text-gold-deep">
              · {t("common.signature")}
            </span>
          ) : null}
        </h3>
        <span className="leader-dots" aria-hidden />
        {hasPrice ? (
          <span className="leader-price font-medium text-forest text-base sm:text-lg">
            {formatPrice(item.price as number, currency)}
          </span>
        ) : (
          <span className="leader-price text-sm italic text-ink-mute tracking-wide">
            {t("common.askStaff")}
          </span>
        )}
      </div>

      {item.description ? (
        <p className="mt-1.5 text-sm text-ink-soft max-w-xl">{item.description}</p>
      ) : null}
    </li>
  );
}
