# Owner's Guide — The Mall IWACU

Day-to-day operations reference. Technical setup lives in
[SUPABASE.md](SUPABASE.md); the production checklist in
[PRODUCTION.md](PRODUCTION.md).

## The three staff pages

| Page | Who | What for |
| --- | --- | --- |
| `/staff` | owner + massage staff | See the week ahead, approve/reject requests, history, **Revenue** tab |
| `/staff/check-in` | massage staff (on their phone) | Log walk-ins, check in today's bookings |
| Supabase dashboard | owner | Accounts, raw data, emergencies |

All staff pages use the same login (created in Supabase → Authentication →
Users). Sessions persist per browser.

## Walk-in flow — every massage must be in the system

When a client shows up **without booking**:

1. Staff opens **`/staff/check-in`** → the **Walk-in** tab (default).
2. Types the client's name (phone optional), taps the service, adjusts the
   time if needed (defaults to now), picks their own name, taps **Log walk-in**.
3. Done — the session is recorded as **completed** and counts as revenue
   immediately. "Add another" resets the form for the next client.

When a client **with a confirmed booking** arrives:

1. Staff opens **`/staff/check-in`** → **Check in booking** tab.
2. Today's confirmed bookings are listed; tap **Check in** next to the client.
3. The booking becomes **completed** — that is the moment it counts as revenue.

## How revenue is calculated

- **Only `completed` sessions count.** A pending request counts for nothing;
  a confirmed booking counts only after it is checked in. No-shows therefore
  never inflate revenue — just don't check them in.
- Each completed session stores a **price snapshot** at check-in time, so
  changing the price list later never rewrites past revenue.
- The **Revenue** tab on `/staff` shows today / this week (Mon–Sun) / this
  calendar month, plus this month's split between online bookings and
  walk-ins, the top 5 services, and per-staff totals.
- Periods are bucketed by **when the session was checked in**, not when it
  was booked.

## Editing the staff list

The names in the check-in dropdowns come from
[`data/staff.json`](data/staff.json) — replace the three placeholders with the
real massage team and push (or ask the developer). This is just a label list;
it is separate from login accounts.

## One-time setup for this feature

Re-run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL
Editor (idempotent — always safe). It adds the walk-in columns
(`source`, `checked_in_at`, `checked_in_by`, `price_rwf`), the `completed`
status, and the staff permissions for logging walk-ins and checking in.
Until it's re-run, the check-in page's buttons will fail.
