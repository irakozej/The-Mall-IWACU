import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit, call or message The Mall IWACU in Kabeza, Kicukiro, Kigali. Map, hours, WhatsApp link and a printable menu QR code.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
