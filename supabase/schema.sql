-- The Mall IWACU — bookings schema
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- It is idempotent (safe to re-run) and creates:
--   - the `bookings` table
--   - an exclusion constraint so two non-cancelled rows cannot overlap
--   - Row-Level Security policies for public read + public pending insert
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
          (booking_date + start_time)::timestamp,
          (booking_date + start_time + (duration_min || ' minutes')::interval)::timestamp
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
