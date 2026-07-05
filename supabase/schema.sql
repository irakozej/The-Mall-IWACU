-- The Mall IWACU — bookings schema
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- It is idempotent (safe to re-run) and creates:
--   - the `bookings` table
--   - an exclusion constraint so two non-cancelled rows cannot overlap
--   - Row-Level Security policies for public read + public pending insert
--   - staff (authenticated) full read access for the /staff dashboard,
--     while anonymous visitors can only read availability columns
--   - realtime publication for the table so the page can subscribe to changes

-- ---------------------------------------------------------------------------
-- 1. Required extension (btree_gist powers the exclusion constraint).
-- ---------------------------------------------------------------------------
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- 2. Table.
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  booking_date date not null,
  start_time time not null,
  duration_min int not null check (duration_min > 0 and duration_min <= 480),
  service_id text,
  service_name text,
  customer_name text,
  customer_phone text,
  customer_notes text,
  status text not null default 'pending',
  -- Walk-in / revenue tracking (see /staff/check-in):
  source text not null default 'online',       -- 'online' | 'walk_in'
  checked_in_at timestamptz,                    -- when the session was logged as done
  checked_in_by text,                           -- staff member who logged it
  price_rwf int                                 -- price snapshot at completion time
);

-- Migration for installs created before the walk-in feature — these ALTERs
-- are no-ops on fresh installs (the create table above already has the
-- columns) and upgrade older tables in place:
--   alter table public.bookings add column source text not null default 'online';
--   alter table public.bookings add column checked_in_at timestamptz;
--   alter table public.bookings add column checked_in_by text;
--   alter table public.bookings add column price_rwf int;
alter table public.bookings add column if not exists source text not null default 'online';
alter table public.bookings add column if not exists checked_in_at timestamptz;
alter table public.bookings add column if not exists checked_in_by text;
alter table public.bookings add column if not exists price_rwf int;

-- Status and source value constraints. 'completed' = the session happened —
-- walk-ins are created completed; confirmed online bookings become completed
-- when staff checks the client in. ONLY completed rows count as revenue.
-- Drop-and-recreate so re-running upgrades installs that lacked 'completed'.
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed'));

alter table public.bookings drop constraint if exists bookings_source_check;
alter table public.bookings
  add constraint bookings_source_check
  check (source in ('online', 'walk_in'));

-- Input hygiene — server-side caps so hand-crafted API calls can't stuff
-- megabytes into text columns or absurd values into price/date. UI caps
-- mirror these; this layer is the one that actually binds.
-- Note: booking_date has an upper bound only — rows keep their past dates
-- and must remain updatable (check-in / cancel). Raise the 60 if
-- maxDaysAhead in data/services.json ever exceeds it.
alter table public.bookings drop constraint if exists bookings_input_check;
alter table public.bookings
  add constraint bookings_input_check
  check (
    char_length(coalesce(customer_name,  '')) <= 120 and
    char_length(coalesce(customer_phone, '')) <= 32  and
    char_length(coalesce(customer_notes, '')) <= 500 and
    char_length(coalesce(service_id,     '')) <= 64  and
    char_length(coalesce(service_name,   '')) <= 120 and
    char_length(coalesce(checked_in_by,  '')) <= 80  and
    coalesce(price_rwf, 0) between 0 and 10000000 and
    booking_date <= current_date + 60
  );

create index if not exists bookings_date_idx on public.bookings(booking_date);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_checked_in_at_idx on public.bookings(checked_in_at);

-- ---------------------------------------------------------------------------
-- 3. Exclusion constraint — atomic protection against double-booking.
--
-- Only CONFIRMED rows participate. Pending requests do NOT reserve a slot —
-- staff approve them from /staff, and approval is the moment the slot locks.
-- Several customers may request the same time; confirming the second one
-- fails on this constraint, which is exactly the protection we want.
--
-- Drop-and-recreate so re-running this file upgrades older installs where
-- the constraint also covered pending rows.
-- ---------------------------------------------------------------------------
-- Note: the exclude expression must use only IMMUTABLE functions. We use
-- make_interval(mins => duration_min) because casting `(text || ' minutes')`
-- to interval is locale-sensitive (not immutable) and Postgres rejects it
-- inside an index/exclusion expression.
alter table public.bookings drop constraint if exists bookings_no_overlap;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    booking_date with =,
    tsrange(
      booking_date + start_time,
      booking_date + start_time + make_interval(mins => duration_min)
    ) with &&
  ) where (status = 'confirmed');

-- ---------------------------------------------------------------------------
-- 4. Row-Level Security.
-- ---------------------------------------------------------------------------
alter table public.bookings enable row level security;

-- Drop pre-existing policies (safe re-run).
drop policy if exists "anon can read non-cancelled" on public.bookings;
drop policy if exists "anon can insert pending"     on public.bookings;
drop policy if exists "anon cannot update"          on public.bookings;
drop policy if exists "anon cannot delete"          on public.bookings;

-- Public reads — only non-cancelled rows are visible.
create policy "anon can read non-cancelled"
  on public.bookings
  for select
  using (status <> 'cancelled');

-- Public inserts — anyone can create a pending ONLINE booking, nothing else
-- (walk-in rows count as revenue, so only staff may create them).
create policy "anon can insert pending"
  on public.bookings
  for insert
  with check (status = 'pending' and source = 'online');

-- No public updates / deletes. Status changes happen through the staff
-- dashboard (authenticated, below) or the Supabase dashboard (service_role).

-- Staff read access — any signed-in user (created from the dashboard under
-- Authentication → Users) can read every row, including cancelled ones and
-- customer details. Sign-ups are disabled in the dashboard, so "authenticated"
-- means exactly the accounts the owner created.
drop policy if exists "staff can read all bookings" on public.bookings;
create policy "staff can read all bookings"
  on public.bookings
  for select
  to authenticated
  using (true);

-- Staff approve / reject / check-in — signed-in staff can change a booking's
-- status from the /staff pages (approve → confirmed, reject → cancelled,
-- check-in → completed). The column grant below limits them to the status +
-- check-in columns; confirming a time that overlaps an already-confirmed
-- booking is rejected atomically by the bookings_no_overlap constraint.
drop policy if exists "staff can update status" on public.bookings;
create policy "staff can update status"
  on public.bookings
  for update
  to authenticated
  using (true)
  with check (status in ('pending', 'confirmed', 'cancelled', 'completed'));

revoke update on public.bookings from anon;
revoke update on public.bookings from authenticated;
grant update (status, checked_in_at, checked_in_by, price_rwf)
  on public.bookings to authenticated;

-- Staff walk-in logging — signed-in staff can insert completed walk-in rows
-- from /staff/check-in. Anonymous visitors still cannot (their insert policy
-- only allows status='pending', and walk-ins require source='walk_in').
drop policy if exists "staff can insert walk-ins" on public.bookings;
create policy "staff can insert walk-ins"
  on public.bookings
  for insert
  to authenticated
  with check (source = 'walk_in' and status = 'completed');

-- ---------------------------------------------------------------------------
-- 4b. Column privacy — anonymous visitors only need availability data.
--
-- The /book page reads date/time/duration/status to grey out taken slots; it
-- never needs customer names, phones or notes. Restricting the anon grant to
-- those columns means the public anon key physically cannot read personal
-- data, even with hand-crafted API calls. Staff accounts (authenticated role)
-- keep the default full-column grant. Realtime (WALRUS) honours column
-- grants too — anon subscribers receive change events with only these columns.
-- ---------------------------------------------------------------------------
revoke select on public.bookings from anon;
grant select (id, created_at, booking_date, start_time, duration_min, status)
  on public.bookings to anon;

-- ---------------------------------------------------------------------------
-- 5. Realtime — publish the table so the BookingForm can subscribe.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;
