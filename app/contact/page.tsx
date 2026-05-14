"use client";

import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import QRCode from "@/components/QRCode";
import { site, siteUrl } from "@/lib/site";
import { useT } from "@/lib/i18n";

export default function ContactPage() {
  const t = useT();
  const menuUrl = `${siteUrl}/menu`;

  return (
    <>
      <section className="bg-forest-deep text-cream relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            {t("contact.kicker")}
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-7xl leading-[0.95]">
            {t("contact.title")}
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            {t("contact.subtitle")}
          </p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("contact.formKicker")}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              {t("contact.formHeading")}
            </h2>
            <p className="mt-3 text-ink-soft max-w-md text-sm">
              {t("contact.formIntro")}
            </p>

            <div className="mt-6">
              <ContactForm />
            </div>

            <a
              href={`https://wa.me/${site.whatsappDigits}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <MessageCircle size={16} /> {t("contact.chatDirectly")}
            </a>
          </div>

          <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <div className="bg-cream-warm border border-ink/10 p-6">
              <h3 className="font-display text-2xl text-forest">{t("contact.visit")}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3">
                  <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                  <span>
                    {site.address.line1}
                    <br />
                    {site.address.line2}
                    <br />
                    {site.address.country}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-gold shrink-0" />
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="hover:text-gold transition-colors tabular-nums"
                  >
                    {site.phone}
                  </a>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-ink-mute">
                    {t("common.callUs")}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle size={16} className="text-gold shrink-0" />
                  <a
                    href={`https://wa.me/${site.whatsappDigits}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-gold transition-colors tabular-nums"
                  >
                    {site.whatsapp}
                  </a>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-ink-mute">
                    {t("common.whatsapp")}
                  </span>
                </li>
                <li className="flex items-center gap-3">
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

            <div className="bg-cream-warm border border-ink/10 p-6">
              <div className="flex items-center gap-2 text-forest">
                <Clock size={16} className="text-gold" />
                <h3 className="text-[11px] tracking-[0.3em] uppercase">{t("contact.hours")}</h3>
              </div>
              <ul className="mt-4 divide-y divide-ink/10">
                {site.hours.map((h) => (
                  <li key={h.day} className="py-2 flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink">{h.day}</span>
                    <span className="font-display text-forest tabular-nums">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-cream-warm border border-ink/10 p-6">
              <h3 className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
                {t("contact.goodToKnow")}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {site.amenities.map((a) => (
                  <li
                    key={a}
                    className="text-[11px] tracking-wide border border-forest/15 text-forest px-2.5 py-1"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-cream-warm grain py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("contact.findUsKicker")}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              {t("contact.findUsHeading")}
            </h2>
            <div className="mt-8 h-[380px]">
              <MapEmbed className="h-full" />
            </div>
          </div>

          <div className="md:col-span-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> {t("contact.qrKicker")}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              {t("contact.qrHeading")}
            </h2>
            <div className="mt-8">
              <QRCode url={menuUrl} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
