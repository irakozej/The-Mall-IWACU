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
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled'))
);

create index if not exists bookings_date_idx on public.bookings(booking_date);
create index if not exists bookings_status_idx on public.bookings(status);

-- ---------------------------------------------------------------------------
-- 3. Exclusion constraint — atomic protection against double-booking.
--
-- Non-cancelled rows for the same date cannot have overlapping time ranges.
-- This is what stops two simultaneous inserts from booking the same slot
-- even if both pass the soft race check in the client.
-- ---------------------------------------------------------------------------
-- Note: the exclude expression must use only IMMUTABLE functions. We use
-- make_interval(mins => duration_min) because casting `(text || ' minutes')`
-- to interval is locale-sensitive (not immutable) and Postgres rejects it
-- inside an index/exclusion expression.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_no_overlap'
  ) then
    alter table public.bookings
      add constraint bookings_no_overlap
      exclude using gist (
        booking_date with =,
        tsrange(
          booking_date + start_time,
          booking_date + start_time + make_interval(mins => duration_min)
        ) with &&
      ) where (status <> 'cancelled');
  end if;
end $$;

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

-- Public inserts — anyone can create a pending booking, nothing else.
create policy "anon can insert pending"
  on public.bookings
  for insert
  with check (status = 'pending');

-- No public updates / deletes. You manage status changes from the
-- Supabase dashboard (which uses the service_role bypass).

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
