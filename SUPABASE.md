# Supabase Booking — Setup Guide

Once this is wired up, every booking submission writes a `pending` row to a
shared database. Every visitor's `/book` page subscribes to the same table
over a websocket, so slots grey out for everyone in real time. You confirm
or reject by changing the row's `status` from the Supabase dashboard — no
code edits, no commits, no deploys.

If you skip this setup, the site falls back to the bundled `data/bookings.json`
file and still works (just without real-time blocking).

---

## 1. Create a Supabase project (free tier is enough)

1. Sign up / log in at <https://supabase.com>.
2. Click **New project**.
3. Pick any name (e.g. `the-mall-iwacu`), set a strong database password, choose
   the region closest to your customers (**Frankfurt** or **Cape Town** is closest
   to Rwanda), keep the **Free** plan.
4. Wait ~1 minute for the project to provision.

## 2. Create the table

1. In the left sidebar click **SQL Editor → New query**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) in this repo, copy the
   whole file, paste it into the editor.
3. Click **Run**. You should see `Success. No rows returned.`

That one query creates the `bookings` table, adds an exclusion constraint
that physically prevents overlapping bookings, enables Row-Level Security
with safe public policies, and turns on realtime for the table.

## 3. Copy your project credentials

1. In the left sidebar click **Project Settings → API**.
2. Note two values:
   - **Project URL** — looks like `https://abcd1234.supabase.co`
   - **anon public** key — long string starting with `eyJ...`

> The anon key is meant to be public — it ships in the browser bundle. RLS
> (set up by the schema above) is what stops anyone from doing anything
> harmful with it.

## 4. Local development

Create `.env.local` in the repo root (copy from `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Then `npm run dev` — open `/book`. You should see a green dot labelled
**Live availability** above step 1. If it's amber and says **Offline mode**,
the env vars aren't reaching the page.

## 5. Production — GitHub Pages

Open your repo on GitHub → **Settings → Secrets and variables → Actions →
New repository secret**. Add two secrets:

| Name                          | Value                              |
| ----------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`    | the Project URL from step 3        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon public key from step 3  |

That's all. The deploy workflow (`.github/workflows/deploy.yml`) already
reads them and passes them through to `npm run build`. Push to `main`,
wait ~2 minutes, hard-refresh — the green dot appears.

---

## Staff dashboard (`/staff`)

The massage employee can see the week ahead and the last 60 days of bookings
(service, customer, price, status) at **`/staff`** — but only after signing in.
One-time setup:

1. **Keep public sign-ups off.** Supabase dashboard → **Authentication →
   Sign In / Up → Email** — disable *"Allow new users to sign up"*. This makes
   "any signed-in user" mean exactly the accounts you create below.
2. **Create the employee's account.** **Authentication → Users → Add user →
   Create new user.** Enter the employee's email and a strong password, and
   tick **Auto Confirm User**.
3. **Re-run [`supabase/schema.sql`](supabase/schema.sql)** in the SQL Editor if
   your project was created before the staff policies were added. It is
   idempotent — re-running is always safe. This grants signed-in staff full
   read access and, importantly, **removes public access to customer names,
   phones and notes** (anonymous visitors can only read slot availability).
4. Give the employee the URL (`https://<your-site>/staff/`), email and
   password. They sign in once per browser; the session persists.

To revoke access (e.g. employee leaves): **Authentication → Users → … → Delete
user**.

---

## Daily workflow

### When a customer books

1. They pick service → date → time → name on `/book` and tap **Request via WhatsApp**.
2. A `pending` row is inserted; their WhatsApp opens with the full booking details pre-filled.
3. Every other browser that has the booking page open sees that slot go grey within ~1 second.

### When you reply

1. Open the **Supabase dashboard → Table Editor → bookings**.
2. Find the row (sorted by `created_at` newest first by default).
3. Change `status`:
   - **`confirmed`** — locks the slot permanently.
   - **`cancelled`** — frees the slot back up immediately for everyone.
4. Reply to the customer on WhatsApp.

### Pending auto-expiry

Pending rows older than 30 minutes are ignored by the client query, so
abandoned half-bookings (customer never sent the WhatsApp message) free up
on their own. You don't need to clean them up. If you want to keep the
table tidy, run this from time to time in the SQL editor:

```sql
delete from bookings
where status = 'pending'
  and created_at < now() - interval '24 hours';
```

---

## Troubleshooting

**"Offline mode" dot stays amber after deploy.**
- Did you add both secrets? Names must match exactly.
- Re-run the failed workflow (Actions tab → latest run → Re-run all jobs).

**Insert fails with `bookings_no_overlap`.**
- Someone else booked the same slot in the same second. The customer's UI
  refreshes and shows the slot as taken. This is the constraint working.

**Realtime never updates other tabs.**
- The schema enables realtime for you. If it stopped, run:
  `alter publication supabase_realtime add table public.bookings;`

**You want to wipe everything and start over.**
```sql
drop table public.bookings cascade;
```
Then re-run `supabase/schema.sql`.
