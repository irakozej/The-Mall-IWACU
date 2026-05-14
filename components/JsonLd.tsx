import { menu } from "@/lib/menu";
import { site, siteUrl } from "@/lib/site";

const phone = site.phone;

// Approximate geo for Kabeza, Kicukiro. Update to exact coords once you have
// claimed the listing on Google Maps and copied the precise lat/lng.
const geo = { lat: -1.9706, lng: 30.1383 };

const openingHours = [
  // Sunday–Thursday 07:00–01:00 (next day) — schema.org uses an end on the next day
  { day: ["Su", "Mo", "Tu", "We", "Th"], opens: "07:00", closes: "25:00" },
  // Friday & Saturday 07:00–02:00
  { day: ["Fr", "Sa"], opens: "07:00", closes: "26:00" },
];

function localBusiness() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Restaurant", "HealthAndBeautyBusiness"],
    "@id": `${siteUrl}#business`,
    name: site.name,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    telephone: phone,
    email: site.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: "Kicukiro",
      addressRegion: "Kigali",
      addressCountry: "RW",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.lat,
      longitude: geo.lng,
    },
    openingHoursSpecification: openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day.map((d) => fullDay(d)),
      opens: clampTime(h.opens),
      closes: clampTime(h.closes),
    })),
    servesCuisine: ["Rwandan", "East African"],
    sameAs: site.socials.map((s) => s.href),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "customer service",
        availableLanguage: ["en", "rw"],
      },
      {
        "@type": "ContactPoint",
        telephone: site.whatsapp,
        contactType: "reservations",
        availableLanguage: ["en", "rw"],
      },
    ],
    potentialAction: {
      "@type": "ReserveAction",
      target: `${siteUrl}/book`,
    },
  };
}

function menuSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${site.name} — Menu`,
    url: `${siteUrl}/menu`,
    hasMenuSection: menu.categories.map((cat) => ({
      "@type": "MenuSection",
      name: cat.name,
      description: cat.tagline,
      hasMenuSection: cat.sections.map((sec) => ({
        "@type": "MenuSection",
        name: sec.title,
        hasMenuItem: sec.items.map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.description,
          offers:
            typeof item.price === "number"
              ? {
                  "@type": "Offer",
                  price: item.price,
                  priceCurrency: "RWF",
                }
              : undefined,
        })),
      })),
    })),
  };
}

type Variant = "home" | "menu" | "default";

export default function JsonLd({ variant = "default" }: { variant?: Variant }) {
  const blocks: Record<string, unknown>[] = [localBusiness()];
  if (variant === "menu") blocks.push(menuSchema());
  if (variant === "home" || variant === "menu") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.name,
      url: siteUrl,
    });
  }
  return (
    <>
      {blocks.map((b, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- intentional inline JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }}
        />
      ))}
    </>
  );
}

function fullDay(code: string): string {
  return {
    Mo: "Monday",
    Tu: "Tuesday",
    We: "Wednesday",
    Th: "Thursday",
    Fr: "Friday",
    Sa: "Saturday",
    Su: "Sunday",
  }[code] as string;
}

// Schema.org accepts 24h times. We collapse next-day closes (e.g. 25:00 → 01:00)
// because the spec only allows 00:00–23:59; consumers infer the next day.
function clampTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
