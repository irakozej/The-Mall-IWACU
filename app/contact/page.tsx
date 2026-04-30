import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import QRCode from "@/components/QRCode";
import { site, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit, call or message The Mall IWACU in Kabeza, Kicukiro, Kigali. Map, hours, WhatsApp link and a printable menu QR code.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const menuUrl = `${siteUrl}/menu`;

  return (
    <>
      <section className="bg-forest-deep text-cream relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            Say Hello
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-7xl leading-[0.95]">
            Contact.
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            Drop in, dial us up, or send a quick message — we are easy to reach.
          </p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> Send a message
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              Tell us how we can help.
            </h2>
            <p className="mt-3 text-ink-soft max-w-md text-sm">
              Reservations, group bookings, treatment availability, or just to
              say hello — we respond on WhatsApp fastest.
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
              <MessageCircle size={16} /> Or chat on WhatsApp directly →
            </a>
          </div>

          <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <div className="bg-cream-warm border border-ink/10 p-6">
              <h3 className="font-display text-2xl text-forest">Visit</h3>
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
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-gold transition-colors">
                    {site.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-gold shrink-0" />
                  <a href={`mailto:${site.email}`} className="hover:text-gold transition-colors">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-cream-warm border border-ink/10 p-6">
              <div className="flex items-center gap-2 text-forest">
                <Clock size={16} className="text-gold" />
                <h3 className="text-[11px] tracking-[0.3em] uppercase">Hours</h3>
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
                Good to know
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
              <span className="rule" /> Find Us
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              We are in Kabeza.
            </h2>
            <div className="mt-8 h-[380px]">
              <MapEmbed className="h-full" />
            </div>
          </div>

          <div className="md:col-span-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> Print for the tables
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              Menu QR.
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
