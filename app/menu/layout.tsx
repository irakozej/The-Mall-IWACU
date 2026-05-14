import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu — Eat, Drink, Spa",
  description:
    "Full menu for The Mall IWACU — Kitchen, Bar, and Massage & Steam. Prices in RWF, served daily in Kabeza, Kicukiro, Kigali.",
  alternates: { canonical: "/menu" },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
