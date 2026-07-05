import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Massage & Wellness",
  description:
    "Massage and body treatments at The Mall IWACU — full price list for massages, facials and steam. Book your session online.",
  alternates: { canonical: "/spa" },
};

export default function SpaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
