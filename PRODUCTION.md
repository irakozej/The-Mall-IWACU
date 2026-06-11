# Production Checklist — The Mall IWACU

The site is live at <https://irakozej.github.io/The-Mall-IWACU/> and every push
to `main` redeploys it automatically. The code side is done — what remains are
**owner inputs** the code cannot supply on its own. Work through this list and
the site is fully production-complete.

## 1. Live bookings — DONE (June 11, 2026), two auth steps remain

The Supabase project is created, the schema is applied, and the credentials
are baked into the deploy workflow — `/book` runs with **Live availability**
in production. Two dashboard-side steps remain (they cannot be done from code):

1. **Re-run [`supabase/schema.sql`](supabase/schema.sql) once (required).**
   The booking flow changed on June 11, 2026 to an approval model — pending
   requests no longer reserve slots, and staff approve/reject from `/staff`.
   That needs the updated overlap constraint and the staff update policy from
   the current schema file. Until it's re-run, approving from `/staff` will
   fail. SQL Editor → paste the whole file → Run (idempotent, safe).
2. **Disable public sign-ups (security).** Supabase dashboard
   → **Authentication → Sign In / Up → Email** → turn off *"Allow new users to
   sign up"*. As of June 11, 2026 sign-ups were still ON, which would let a
   stranger self-register and read customer details through the staff policy.
3. **Create the massage employee's login** for the **`/staff` dashboard** —
   **Authentication → Users → Add user** (tick *Auto Confirm User*). See
   "Staff dashboard" in [SUPABASE.md](SUPABASE.md).

Housekeeping: the bookings table contains one row dated `2026-01-05` named
"TEST ROW — safe to delete" (used to verify the connection). Delete it from
the Table Editor whenever.

## 2. Replace the 3 stock photos

Only `public/images/Bar.jpeg` is a real photo. These three still use Unsplash
stock images:

| Where                          | File / line                          | Subject needed            |
| ------------------------------ | ------------------------------------ | ------------------------- |
| Home — lifestyle strip, card 1 | `components/LifestyleStrip.tsx`      | Kitchen / brochettes      |
| Home — lifestyle strip, card 3 | `components/LifestyleStrip.tsx`      | Massage / steam room      |
| About page photo               | `app/about/page.tsx` (~line 99)      | Groceries / storefront    |

Drop real photos into `public/images/` (JPEG, ≤ ~400 KB each — resize before
committing, the static export ships them as-is) and change the `src` values to
`/images/<name>.jpeg`.

## 3. Real testimonials

`data/testimonials.json` contains **fictional placeholder quotes**. Replace
them with real customer quotes (with permission) before promoting the site —
publishing invented reviews can damage trust and may breach advertising rules.

## 4. Verify the social media links

`lib/site.ts → site.socials` now points at handle-based URLs
(`instagram.com/themalliwacu`, etc.) but **these accounts are not confirmed to
exist**. Create/claim the profiles or update the URLs to the real ones.

## 5. Contact email

`lib/site.ts` lists `hello@themalliwacu.rw`. That mailbox only works if the
domain is registered and email is set up. Either register the domain (see #6)
or swap in an address that actually receives mail (e.g. a Gmail address).

## 6. Optional — custom domain

The site works fine on github.io. If you buy `themalliwacu.rw` (or similar):

1. Add a `CNAME` file in `public/` containing just the domain.
2. Point the domain's DNS at GitHub Pages (A/AAAA or CNAME records — GitHub
   docs: "Managing a custom domain").
3. In `.github/workflows/deploy.yml`, set `NEXT_PUBLIC_SITE_URL` to the domain
   and `NEXT_PUBLIC_BASE_PATH` to empty.
4. Re-print the menu QR code from `/contact` afterwards — it encodes the URL.

## 7. Optional — Google Business listing

The map embed searches for "The Mall IWACU Kabeza" and falls back to the area
if the listing isn't verified. Claiming the business on Google Maps makes the
pin exact and adds the business to local search results.

---

### Already done (for reference)

- Next.js 14 static site: Home, Menu (Kitchen/Bar/Spa), Book, About, Contact,
  Privacy, Terms, custom 404
- Full bilingual EN / Kinyarwanda (verified key parity)
- 4-step booking flow: Supabase realtime slot-blocking + WhatsApp handoff +
  booking references + JSON/localStorage fallback when offline
- Real menu data from the owner's documents (`data/menu.json`)
- Contact form → prefilled WhatsApp message
- Printable / downloadable menu QR code
- SEO: sitemap, robots, OpenGraph image, JSON-LD structured data, PWA manifest
- CI/CD: GitHub Actions → GitHub Pages with automatic basePath handling
