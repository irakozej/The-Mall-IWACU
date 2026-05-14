"use client";

import Link from "next/link";
import { Instagram, Facebook, Music2, MapPin, Phone, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";

export default function Footer() {
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-forest-deep text-cream/85 mt-20 sm:mt-28">
      <div className="imigongo-strip" aria-hidden />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20 grid gap-12 md:grid-cols-3">
        <div>
          <div className="font-display text-3xl text-cream leading-none">
            The Mall <span className="italic text-gold">IWACU</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed max-w-xs text-cream/70">
            {t("footer.blurb")}
          </p>
          <p className="mt-6 text-[11px] tracking-[0.25em] uppercase text-gold/80">
            {t("footer.iwacuMeaning")}
          </p>
        </div>

        <div>
          <h3 className="text-[11px] tracking-[0.25em] uppercase text-gold/80 mb-5">
            {t("footer.visit")}
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin size={16} className="mt-0.5 text-gold shrink-0" />
              <span>
                {site.address.line1}
                <br />
                {site.address.line2}
              </span>
            </li>
            <li className="flex gap-3 items-center">
              <Phone size={16} className="text-gold shrink-0" />
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="hover:text-gold transition-colors"
              >
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3 items-center">
              <Mail size={16} className="text-gold shrink-0" />
              <a
                href={`mailto:${site.email}`}
                className="hover:text-gold transition-colors"
              >
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] tracking-[0.25em] uppercase text-gold/80 mb-5">
            {t("footer.connect")}
          </h3>
          <ul className="space-y-3 text-sm">
            {site.socials.map((s) => {
              const Icon =
                s.label === "Instagram" ? Instagram :
                s.label === "Facebook" ? Facebook : Music2;
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-3 hover:text-gold transition-colors"
                  >
                    <Icon size={16} className="text-gold" />
                    <span>{s.label}</span>
                    <span className="text-cream/50">{s.handle}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-cream/60">
            {site.hours.map((h) => (
              <div key={h.day}>
                <div className="text-cream/85">{h.day}</div>
                <div>{h.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-cream/55">
          <p>© {year} The Mall IWACU. {t("footer.rights")}</p>
          <nav className="flex gap-5 flex-wrap">
            <Link href="/menu" className="hover:text-gold transition-colors">{t("nav.menu")}</Link>
            <Link href="/book" className="hover:text-gold transition-colors">{t("nav.book")}</Link>
            <Link href="/about" className="hover:text-gold transition-colors">{t("nav.about")}</Link>
            <Link href="/contact" className="hover:text-gold transition-colors">{t("nav.contact")}</Link>
            <Link href="/privacy" className="hover:text-gold transition-colors">{t("nav.privacy")}</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">{t("nav.terms")}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
