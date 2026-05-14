import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Massage",
  description:
    "Reserve a massage or treatment at The Mall IWACU — choose a service, date and time. Confirmation via WhatsApp.",
  alternates: { canonical: "/book" },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
