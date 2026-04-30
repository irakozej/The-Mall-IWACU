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
import { site } from "@/lib/site";

const ICON_PROPS = { size: 20, strokeWidth: 1.6 };

const services = [
  {
    icon: <ShoppingBasket {...ICON_PROPS} />,
    title: "Groceries",
    description:
      "Daily essentials, fresh produce, and pantry staples — quick stops, fair prices, neighborly service.",
    href: "/about#groceries",
    cta: "Stop & Shop",
  },
  {
    icon: <Wine {...ICON_PROPS} />,
    title: "Bar",
    description:
      "Cold local beers, refreshing soft drinks, wines and a cocktail of the day — the easy way to wind down.",
    href: "/menu#cat-bar",
    cta: "Pull Up a Stool",
  },
  {
    icon: <ChefHat {...ICON_PROPS} />,
    title: "Kitchen",
    description:
      "Home-cooked Rwandan plates, brochettes, grilled tilapia and daily buffet — comfort food, served warm.",
    href: "/menu#cat-kitchen",
    cta: "See the Menu",
  },
  {
    icon: <Sparkles {...ICON_PROPS} />,
    title: "Massage & Steam",
    description:
      "Full-body massage, reflexology, herbal steam — slow down, breathe, reset right around the corner.",
    href: "/menu#cat-spa",
    cta: "Book Time",
  },
];

const values = [
  {
    icon: Heart,
    title: "Community First",
    body: "We were built around our neighbors. Familiar faces, friendly service, real conversations.",
  },
  {
    icon: Award,
    title: "Quality You Can Taste",
    body: "From fresh ingredients to attentive treatments — quality is the only standard we know.",
  },
  {
    icon: Sprout,
    title: "All-In-One",
    body: "Four services, one warm roof. Stop by once and leave with everything you needed.",
  },
  {
    icon: MapPin,
    title: "Right Around the Corner",
    body: "Easy to find in Kabeza — close enough that we are part of the everyday.",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Services */}
      <section id="services" className="relative bg-cream py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
                <span className="rule" />
                Four services, one address
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight max-w-2xl">
                Everything your day needs — under one roof.
              </h2>
            </div>
            <p className="md:max-w-sm text-sm text-ink-soft">
              The Mall IWACU is the corner where errands, meals, drinks and rest
              come together. Pick a doorway.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {services.map((s, i) => (
              <ServiceCard key={s.title} index={i + 1} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle photo strip — three scenes from the mall */}
      <LifestyleStrip />

      {/* Why us — editorial split */}
      <section className="relative bg-cream-warm py-20 sm:py-28 grain">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> Why The Mall IWACU
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl text-forest leading-[1.05]">
              A neighborhood gem — built for the
              <span className="italic text-gold"> everyday</span>.
            </h2>
            <p className="mt-6 text-ink-soft leading-relaxed max-w-md">
              <span className="font-display italic text-forest">Iwacu</span> means
              “at home,” and that is the feeling we are after — wherever you walk
              through our doors, you should feel it the moment you arrive.
            </p>
          </div>

          <div className="md:col-span-7 grid sm:grid-cols-2 gap-x-8 gap-y-10">
            {values.map((v, i) => (
              <div key={v.title}>
                <div className="text-[10px] tracking-[0.3em] uppercase text-ink-mute">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <v.icon size={20} className="text-gold mt-1 shrink-0" />
                  <div>
                    <h3 className="font-display text-2xl text-forest leading-tight">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                      {v.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hours + Map */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> Operating Hours
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight">
              Come find us.
            </h2>

            <div className="mt-8 bg-cream-warm border border-ink/10 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-forest">
                <Clock size={18} className="text-gold" />
                <span className="text-[11px] tracking-[0.3em] uppercase">When we are open</span>
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
                  See Full Menu
                </Link>
                <a
                  href={site.mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-forest/40 text-forest px-5 py-2.5 text-sm hover:bg-forest hover:text-cream transition-colors"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> Find Us
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight">
              Kabeza, Kicukiro.
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
