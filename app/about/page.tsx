import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Quote, Heart, Sprout, ChefHat, Smile } from "lucide-react";
import ImigongoPattern from "@/components/ImigongoPattern";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Mall IWACU is your all-in-one neighborhood hub in the heart of Kabeza, Kicukiro — groceries, bar, kitchen, and massage & steam.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Heart, title: "Community", body: "Built around our neighbors. The faces who walk in every day make this what it is." },
  { icon: Sprout, title: "Quality", body: "From shelves to plates to treatments — we choose better, every day." },
  { icon: Smile, title: "Convenience", body: "Four services, one warm roof. Stop by once, leave with everything you needed." },
  { icon: ChefHat, title: "Hospitality", body: "Iwacu means at home — and that is exactly the welcome we serve." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative bg-forest-deep text-cream overflow-hidden">
        <ImigongoPattern className="absolute -right-24 -top-24 w-[480px] h-[480px] opacity-90" />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            About The Mall IWACU
          </p>
          <h1 className="mt-3 font-display text-5xl sm:text-7xl leading-[0.95] max-w-3xl">
            A small place with a <span className="italic text-gold">big welcome</span>.
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
              The Mall IWACU is your all-in-one neighborhood hub in the heart of
              Kabeza, Kicukiro.
            </p>
            <p className="mt-5 text-ink-soft leading-relaxed">
              Whether you are picking up fresh groceries, enjoying a cold drink at
              our bar, savoring home-cooked Rwandan meals, or treating yourself to
              a relaxing massage — we have got you covered, all under one roof.
            </p>
          </div>

          <div className="md:col-span-7 md:border-l md:border-ink/10 md:pl-10">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> Our Story
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              Four small businesses, one shared idea.
            </h2>
            <div className="mt-6 space-y-4 text-ink-soft leading-relaxed">
              <p>
                We started The Mall IWACU because the people of Kabeza deserve a
                place that fits how a real day actually goes — pick up tonight’s
                dinner, sit down for a quick brochette, share a beer with a
                friend, then unwind with a steam before heading home.
              </p>
              <p>
                Every corner of the mall is run with care: produce we would buy
                ourselves, a kitchen that cooks how Rwandans cook at home, a bar
                that knows your usual, and a quiet wing for massage and steam
                when life asks too much.
              </p>
              <p>
                We are not a chain. We are a corner. And we are glad you are here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-warm grain py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
            <span className="rule" /> What we stand for
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest leading-tight max-w-2xl">
            Four values, one steady standard.
          </h2>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
            {values.map((v, i) => (
              <div key={v.title}>
                <div className="text-[10px] tracking-[0.3em] uppercase text-ink-mute">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <v.icon size={22} className="text-gold mt-3" />
                <h3 className="mt-3 font-display text-2xl text-forest">{v.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner / Team placeholder */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-forest text-cream">
              <Image
                src="https://images.unsplash.com/photo-1593708659671-595be1c95128"
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
                    The Owner
                  </p>
                  <p className="mt-2 font-display text-3xl">Iwacu Family</p>
                  <p className="mt-2 text-cream/85 text-sm">Kabeza, Kicukiro</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-deep">
              <span className="rule" /> A note from us
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-forest leading-tight">
              We will see you soon.
            </h2>
            <p className="mt-5 text-ink-soft leading-relaxed">
              We are a family-run business, proud of our corner. If something
              could be better — a dish, a service, a smile — please tell us. We
              listen, and we improve.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-forest text-cream px-5 py-2.5 text-sm hover:bg-forest-deep transition-colors"
              >
                Browse the Menu
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-forest/40 text-forest px-5 py-2.5 text-sm hover:bg-forest hover:text-cream transition-colors"
              >
                Say Hello
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
