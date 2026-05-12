import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import ImigongoPattern from "@/components/ImigongoPattern";

export const metadata: Metadata = {
  title: "Book a Massage",
  description:
    "Reserve a massage or treatment at The Mall IWACU — choose a service, date and time. Confirmation via WhatsApp.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <>
      <section className="relative bg-forest-deep text-cream overflow-hidden">
        <ImigongoPattern className="absolute -right-20 -top-20 w-[420px] h-[420px] opacity-80" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            Massage & Wellness
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-7xl leading-[0.95]">
            Book a session.
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            Four steps. Your start and finish times are calculated from the
            treatment you choose. We confirm on WhatsApp.
          </p>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <BookingForm />
        </div>
      </section>
    </>
  );
}
