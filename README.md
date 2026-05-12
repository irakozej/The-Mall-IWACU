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
npm run build              # static export → ./out
npx serve out              # preview the export locally
```

> Note: `next start` is **not** used here because the project is configured for
> static export (`output: 'export'` in `next.config.mjs`). To preview the
> production output, serve `./out` with any static server.

## Deploy to GitHub Pages

Already wired up. One-time repo setup:

1. Push this repository to GitHub.
2. In the repo on GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.

That is it. Every push to `main` triggers `.github/workflows/deploy.yml`,
which:

- Computes the base path automatically (project page → `/<repo>`,
  user/org page → empty).
- Runs `npm run build` to produce the `out/` static export.
- Adds `.nojekyll` so GitHub Pages keeps `_next/` assets.
- Publishes via the official `actions/deploy-pages` action.

The deployed URL is shown in the workflow run summary
(usually `https://<owner>.github.io/<repo>/`).

### Custom domain

If you point a custom domain (e.g. `themalliwacu.rw`) at GitHub Pages:

1. Add a `CNAME` file to `public/` containing just the domain.
2. In the workflow, override `NEXT_PUBLIC_SITE_URL` with `https://themalliwacu.rw`
   and set `NEXT_PUBLIC_BASE_PATH` to empty so internal links resolve at the root.

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
- **Bookable massage services**: `data/services.json` (name, duration, price).

## Bookings workflow

The `/book` page lets a customer pick a treatment, date and time, then submits
the request via WhatsApp. The booking page does **not** write to a database —
GitHub Pages is static. Two mechanisms together prevent double-booking:

1. **Local hold** — once a customer submits, their slot is held in their own
   browser's `localStorage` for 24 hours. Same browser cannot pick the same
   slot again.
2. **Confirmed bookings file** — when you confirm a request on WhatsApp, add
   one entry to `data/bookings.json` and push. The next deploy excludes that
   slot from every visitor's view.

   ```json
   {
     "bookings": [
       { "date": "2026-05-13", "startTime": "10:00", "durationMin": 60 }
     ]
   }
   ```

   `date` is `YYYY-MM-DD`, `startTime` is 24-hour `HH:MM`, `durationMin` is
   the service length in minutes (must match the service so overlap maths
   work). Slot starts every 30 minutes inside working hours (`09:00–21:00`);
   adjust in `data/services.json`.

> For real-time blocking across visitors *before* you confirm, a free
> Supabase project would replace the JSON file with an API write. Until then,
> reply on WhatsApp promptly.

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
