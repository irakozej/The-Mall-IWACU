import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for The Mall IWACU website, online menu, and massage booking flow.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const updated = "May 2026";
  return (
    <>
      <section className="bg-forest-deep text-cream relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            Terms of Use
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-6xl leading-[0.95]">
            The fine print.
          </h1>
          <p className="mt-3 text-cream/75 text-sm">Last updated · {updated}</p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-14 sm:py-20">
        <article className="max-w-3xl mx-auto px-5 sm:px-8 prose prose-ink space-y-8 text-ink-soft text-base leading-relaxed">
          <Block title="Using this website">
            <p>
              You are welcome to browse this site, scan its QR code, and share
              its links. Please do not scrape, abuse the booking form, or use
              it to impersonate someone else.
            </p>
          </Block>

          <Block title="Menu, prices and availability">
            <p>
              The menu shown here is updated as often as we can manage, but
              prices and availability may change without notice. The version
              served at the table or counter takes precedence over anything you
              see online.
            </p>
          </Block>

          <Block title="Bookings">
            <p>
              Submitting the booking form opens a pre-filled WhatsApp message.
              The booking is only confirmed once a member of our team replies
              to confirm it. Until then, your slot is held tentatively in your
              browser for 24 hours but is not guaranteed.
            </p>
            <p>
              If you need to cancel or change a confirmed booking, please
              reply on the WhatsApp thread or call us as far in advance as you
              can — at minimum two hours before your appointment.
            </p>
          </Block>

          <Block title="Massage and wellness services">
            <p>
              Our wellness services are for relaxation and general comfort.
              They are not medical treatments. If you have a medical condition
              — pregnancy, recent injury, heart issues, skin sensitivities —
              tell your therapist before the session so we can adjust or
              advise you to consult a doctor first.
            </p>
          </Block>

          <Block title="Photos and third-party content">
            <p>
              Photos used on this site are illustrative. Logos and brand names
              referenced in the menu belong to their respective owners and
              appear here only to identify the products we serve.
            </p>
          </Block>

          <Block title="Liability">
            <p>
              We do our best to keep this website accurate and online, but we
              cannot guarantee it is error-free or always available. To the
              extent permitted by law, we are not liable for any indirect loss
              arising from your use of this site.
            </p>
          </Block>

          <Block title="Contact">
            <p>
              Anything to discuss? Reach us at{" "}
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
            <Link href="/privacy" className="underline underline-offset-2 hover:text-gold-deep">
              Privacy Notice
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
