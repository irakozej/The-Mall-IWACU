// Public site URL — used for OpenGraph, canonical links, and the QR code.
// Set NEXT_PUBLIC_SITE_URL at build time (the GitHub Pages workflow does this
// automatically). Falls back to the production domain.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://themalliwacu.rw";

export const site = {
  name: "The Mall IWACU",
  tagline: "Your Neighborhood Destination — Eat, Drink, Shop, Relax",
  shortTagline: "Eat. Drink. Shop. Relax.",
  address: {
    line1: "Kabeza, Kanombe",
    line2: "Kicukiro District, Kigali",
    country: "Rwanda",
    full: "Kabeza, Kanombe, Kicukiro District, Kigali, Rwanda",
  },
  phone: "+250 787 252 490",
  phoneDigits: "250787252490",
  whatsappDigits: "250787252490",
  email: "hello@themalliwacu.rw",
  hours: [
    { day: "Sunday – Thursday", time: "07:00 — 01:00" },
    { day: "Friday – Saturday", time: "07:00 — 02:00" },
  ],
  hoursShort: "Sun–Thu · 07:00–01:00   ·   Fri–Sat · 07:00–02:00",
  amenities: [
    "Free Wi-Fi",
    "On-site parking",
    "Card & Mobile Money accepted",
    "Family-friendly",
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com/", handle: "@themalliwacu" },
    { label: "Facebook", href: "https://facebook.com/", handle: "The Mall IWACU" },
    { label: "TikTok", href: "https://tiktok.com/", handle: "@themalliwacu" },
  ],
  // Embed query targets the business name first; Google falls back to the area
  // if the listing is not yet verified.
  mapEmbed:
    "https://maps.google.com/maps?q=The+Mall+IWACU+Kabeza+Kicukiro+Kigali&t=&z=16&ie=UTF8&iwloc=&output=embed",
  mapLink:
    "https://www.google.com/maps/search/?api=1&query=The+Mall+IWACU+Kabeza+Kicukiro+Kigali",
};

export type SiteConfig = typeof site;
