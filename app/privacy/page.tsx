import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How The Mall IWACU handles your information when you visit our website, book a treatment or contact us.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const updated = "May 2026";
  return (
    <>
      <section className="bg-forest-deep text-cream relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            Privacy Notice
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-6xl leading-[0.95]">
            How we handle your information.
          </h1>
          <p className="mt-3 text-cream/75 text-sm">Last updated · {updated}</p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-14 sm:py-20">
        <article className="max-w-3xl mx-auto px-5 sm:px-8 prose prose-ink space-y-8 text-ink-soft text-base leading-relaxed">
          <p>
            We keep things simple. This website is a small marketing site for
            The Mall IWACU in Kabeza, Kicukiro. It does not run user accounts,
            it does not host a payment system, and it does not collect personal
            data on the server. This notice explains the few places where
            information moves at all.
          </p>

          <Block title="Contact and booking forms">
            <p>
              The contact form and the massage booking form open your
              WhatsApp app pre-filled with the details you entered (your name,
              optional phone, optional notes, and the service/date/time for
              bookings). Nothing is stored on our website servers. The
              conversation that follows is handled by you and us inside
              WhatsApp, governed by{" "}
              <a
                href="https://www.whatsapp.com/legal/privacy-policy"
                target="_blank"
                rel="noreferrer noopener"
                className="text-forest underline decoration-gold/60 underline-offset-2 hover:text-gold-deep"
              >
                WhatsApp's own privacy policy
              </a>
              .
            </p>
          </Block>

          <Block title="Local storage on your device">
            <p>
              The booking page uses your browser's <code>localStorage</code> to
              hold the slot you have just requested for 24 hours. This only
              lives on your device, only your browser can read it, and we
              cannot see it. Clear your browser data to remove it at any time.
            </p>
          </Block>

          <Block title="Third-party content">
            <p>
              We embed a Google Maps iframe so you can find us. When the map
              loads, Google may set its own cookies. Photos are served from the
              Unsplash CDN; loading them sends a regular HTTP request to
              Unsplash. We do not run any analytics scripts.
            </p>
          </Block>

          <Block title="Your data rights">
            <p>
              Because we do not collect or store any information about you on
              this website, there is nothing for us to delete or export. For
              messages you have sent us on WhatsApp, you can request deletion
              by replying to that conversation, or by emailing{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-forest underline decoration-gold/60 underline-offset-2 hover:text-gold-deep"
              >
                {site.email}
              </a>
              .
            </p>
          </Block>

          <Block title="Changes to this notice">
            <p>
              If anything changes — for example, we add an online payment
              option in the future — we will update this page and the "last
              updated" date above.
            </p>
          </Block>

          <Block title="Contact us">
            <p>
              Questions about this notice? Reach us at{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-forest underline decoration-gold/60 underline-offset-2 hover:text-gold-deep"
              >
                {site.email}
              </a>{" "}
              or on{" "}
              <a
                href={`https://wa.me/${site.whatsappDigits}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-forest underline decoration-gold/60 underline-offset-2 hover:text-gold-deep"
              >
                WhatsApp
              </a>
              .
            </p>
          </Block>

          <p className="text-sm text-ink-mute pt-6 border-t border-ink/10">
            See also our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-gold-deep">
              Terms of Use
            </Link>
            .
          </p>
        </article>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-forest mt-2 mb-3">{title}</h2>
      {children}
    </section>
  );
}
