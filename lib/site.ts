// Public site URL — used for OpenGraph, canonical links, and the QR code.
// Set NEXT_PUBLIC_SITE_URL at build time (the GitHub Pages workflow does this
// automatically). Falls back to the production domain.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://themalliwacu.rw";

// Just the origin (no basePath). Use this for Next.js `metadataBase`, because
// Next.js prepends the basePath again to relative metadata URLs. If we pass
// the full siteUrl (origin + basePath) the basePath ends up duplicated.
export const siteOrigin = (() => {
  try {
    return new URL(siteUrl).origin;
  } catch {
    return siteUrl;
  }
})();

// Base path the app is served under (e.g. "/The-Mall-IWACU" on GitHub Pages,
// "" locally). With static export, Next.js auto-prefixes `<Link>` and the
// `_next/` assets — but NOT local public/ paths in `<Image src="/foo.jpg">`,
// the manifest, or icons. Use `withBasePath()` for those.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  if (basePath && !path.startsWith(`${basePath}/`)) return `${basePath}${path}`;
  return path;
}

/**
 * Build an Unsplash CDN URL sized for the rendered slot. Without these query
 * params Unsplash serves the original ~4000px source which can be 3–8MB —
 * fine in dev where next/image optimizes, but fatal in static export mode
 * (`unoptimized: true`) where the raw URL ships to the browser.
 *
 * Inputs that aren't an Unsplash reference (e.g. a local `/images/foo.jpg`
 * path) are returned unchanged so the same helper works for mixed sources.
 */
export function unsplashSrc(input: string, width = 1400, quality = 72): string {
  // Local public/ path — apply basePath and return.
  if (input.startsWith("/")) {
    return withBasePath(input);
  }
  if (!input.includes("unsplash.com") && !input.startsWith("photo-")) {
    return input;
  }
  const id = input.replace(/^https:\/\/images\.unsplash\.com\//, "").split("?")[0];
  return `https://images.unsplash.com/${id}?w=${width}&q=${quality}&auto=format&fit=crop`;
}

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
  whatsapp: "+250 788 536 901",
  whatsappDigits: "250788536901",
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
  // Replace these with the business's verified profile URLs once created —
  // the handle-based links below are best guesses, not confirmed accounts.
  socials: [
    { label: "Instagram", href: "https://instagram.com/themalliwacu", handle: "@themalliwacu" },
    { label: "Facebook", href: "https://facebook.com/search/top?q=The%20Mall%20IWACU", handle: "The Mall IWACU" },
    { label: "TikTok", href: "https://tiktok.com/@themalliwacu", handle: "@themalliwacu" },
  ],
  // Embed query targets the business name first; Google falls back to the area
  // if the listing is not yet verified.
  mapEmbed:
    "https://maps.google.com/maps?q=The+Mall+IWACU+Kabeza+Kicukiro+Kigali&t=&z=16&ie=UTF8&iwloc=&output=embed",
  mapLink:
    "https://www.google.com/maps/search/?api=1&query=The+Mall+IWACU+Kabeza+Kicukiro+Kigali",
};

export type SiteConfig = typeof site;
