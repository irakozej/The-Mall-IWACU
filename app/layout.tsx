import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { siteOrigin, siteUrl } from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "The Mall IWACU — Eat, Drink, Shop, Relax | Kigali",
    template: "%s · The Mall IWACU",
  },
  description:
    "Your neighborhood destination in Kabeza, Kicukiro — groceries, bar, kitchen, and massage & steam, all under one roof.",
  keywords: [
    "The Mall IWACU",
    "Kabeza",
    "Kicukiro",
    "Kanombe",
    "Kigali",
    "restaurant",
    "bar",
    "groceries",
    "massage",
    "steam",
    "Rwanda",
  ],
  openGraph: {
    title: "The Mall IWACU — Eat, Drink, Shop, Relax",
    description:
      "Groceries, bar, kitchen, and massage & steam, all under one roof in Kabeza, Kicukiro, Kigali.",
    url: siteUrl,
    siteName: "The Mall IWACU",
    locale: "en_RW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Mall IWACU — Eat, Drink, Shop, Relax",
    description:
      "Your neighborhood hub in Kabeza, Kicukiro — eat, drink, shop, relax.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon-512.svg" }],
  },
  manifest: "/manifest.webmanifest",
  applicationName: "The Mall IWACU",
  appleWebApp: {
    capable: true,
    title: "Iwacu",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#1B4332",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans bg-cream text-ink antialiased">
        <Navbar />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
