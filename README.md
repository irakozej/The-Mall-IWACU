# The Mall IWACU

Production-ready website for **The Mall IWACU** — a multi-service neighborhood
business in Kabeza, Kicukiro, Kigali. Groceries, bar, kitchen, and massage &
steam, all under one warm roof.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion**.

## Stack

- Next.js 14 (App Router, static rendering)
- TypeScript (strict)
- Tailwind CSS with brand-tuned palette
- Framer Motion (subtle, restrained motion)
- `qrcode.react` for the printable menu QR code
- `lucide-react` for icons

No database, no paid APIs — all menu content lives in `data/menu.json`.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run build && npm run start  # production
```

## File structure

```
app/
  layout.tsx          root layout, fonts, metadata
  page.tsx            home
  menu/
    page.tsx          full menu (Kitchen | Bar | Massage & Steam)
    loading.tsx       skeleton
  about/page.tsx
  contact/page.tsx
  not-found.tsx
components/
  Navbar.tsx          sticky, mobile hamburger
  Footer.tsx
  HeroSection.tsx
  ServiceCard.tsx
  MenuTabs.tsx        sticky tabs + search + smooth scroll
  MenuCard.tsx        editorial dotted-leader item row
  MapEmbed.tsx        Google Maps iframe (no API key)
  QRCode.tsx          downloadable / printable
  WhatsAppButton.tsx  floating
  ContactForm.tsx     opens prefilled WhatsApp on submit
  ImigongoPattern.tsx Rwandan-inspired chevron SVG
data/menu.json        all menu items — edit prices here
lib/menu.ts           types + helpers
lib/site.ts           contact info, hours, social
public/
  favicon.svg
  images/             placeholder
```

## Editing content

- **Menu prices and items**: `data/menu.json`. Categories → sections → items.
  Each item is `{ name, description?, price, featured? }`. Prices are numbers in RWF.
- **Phone / address / hours / socials**: `lib/site.ts`.
- **Brand colors**: `tailwind.config.ts` (`forest`, `gold`, `cream`, `ink`).

## QR code

`/contact` shows a generated QR pointing to `/menu`. Print it for tables — the
component supports a one-click PNG download and a print button.

> Update the `SITE_URL` in `app/contact/page.tsx` to your final domain so the
> printed QR resolves correctly.

## Performance

- Static generation for all routes; only the menu uses interactive
  client components (search/scroll observer).
- `next/font` for self-hosted Playfair Display + Inter (no FOUT).
- Menu page intentionally text-only — fast on mobile / poor connectivity, ideal
  for QR scans.

## Design notes

- Deep forest `#1B4332` + warm gold `#D4A017` on a paper-cream `#FAF9F6` base.
- Subtle Imigongo-inspired chevron pattern as a quiet decorative motif.
- Editorial menu typography with dotted leader lines from item to price.
- Faint paper grain on warm sections.
