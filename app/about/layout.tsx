import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Mall IWACU is your all-in-one neighborhood hub in the heart of Kabeza, Kicukiro — groceries, bar, kitchen, and massage & steam.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
