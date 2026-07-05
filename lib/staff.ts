import type { Session } from "@supabase/supabase-js";
import { getSupabase, type BookingRow } from "./supabase";
import { config, minutesToTime, timeToMinutes } from "./booking";

/**
 * Staff-facing booking — the full row, enriched with the service price
 * resolved from data/services.json (the bookings table doesn't store prices,
 * so we look them up by service id with a name-match fallback for rows
 * created before a service was renamed).
 */
export type StaffBooking = {
  id: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  durationMin: number;
  serviceId: string | null;
  serviceName: string;
  customerName: string;
  customerPhone: string | null;
  customerNotes: string | null;
  status: BookingRow["status"];
  source: BookingRow["source"];
  checkedInAt: string | null;
  checkedInBy: string | null;
  createdAt: string;
  price: number | null;
};

function resolvePrice(serviceId: string | null, serviceName: string | null): number | null {
  const byId = serviceId
    ? config.services.find((s) => s.id === serviceId)
    : undefined;
  if (byId) return byId.price;
  const byName = serviceName
    ? config.services.find(
        (s) => s.name.toLowerCase() === serviceName.toLowerCase(),
      )
    : undefined;
  return byName ? byName.price : null;
}

function rowToStaffBooking(r: BookingRow): StaffBooking {
  const startTime = r.start_time.slice(0, 5);
  return {
    id: r.id,
    date: r.booking_date,
    startTime,
    endTime: minutesToTime(timeToMinutes(startTime) + r.duration_min),
    durationMin: r.duration_min,
    serviceId: r.service_id,
    serviceName: r.service_name ?? "—",
    customerName: r.customer_name ?? "—",
    customerPhone: r.customer_phone,
    customerNotes: r.customer_notes,
    status: r.status,
    source: r.source ?? "online",
    checkedInAt: r.checked_in_at ?? null,
    checkedInBy: r.checked_in_by ?? null,
    createdAt: r.created_at,
    // Prefer the price snapshot taken at completion; fall back to the current
    // services.json price for older / not-yet-completed rows.
    price: r.price_rwf ?? resolvePrice(r.service_id, r.service_name),
  };
}

/**
 * Fetch full booking rows for a date range (inclusive). Requires a signed-in
 * staff session — RLS only exposes customer columns to the authenticated role.
 */
export async function fetchStaffBookings(
  fromDate: string,
  toDate: string,
): Promise<StaffBooking[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .gte("booking_date", fromDate)
    .lte("booking_date", toDate)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as BookingRow[]).map(rowToStaffBooking);
}

/* --------------------------- Walk-in check-in ---------------------------- */

export type WalkInInput = {
  customerName: string;
  customerPhone?: string;
  serviceId: string;
  serviceName: string;
  durationMin: number;
  price: number;
  date: string;        // YYYY-MM-DD (today)
  startTime: string;   // HH:MM
  staffName: string;
  notes?: string;
};

/**
 * Log a client who showed up without booking. Inserted straight as a
 * COMPLETED walk-in so it counts as revenue immediately. Requires a staff
 * session — RLS only lets the authenticated role insert walk-in rows.
 */
export async function createWalkIn(
  input: WalkInInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured" };

  const { error } = await supabase.from("bookings").insert({
    booking_date: input.date,
    start_time: `${input.startTime}:00`,
    duration_min: input.durationMin,
    service_id: input.serviceId,
    service_name: input.serviceName,
    customer_name: input.customerName,
    customer_phone: input.customerPhone ?? null,
    customer_notes: input.notes ?? null,
    status: "completed",
    source: "walk_in",
    checked_in_at: new Date().toISOString(),
    checked_in_by: input.staffName,
    price_rwf: input.price,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/**
 * Mark a confirmed online booking as done: status → completed, with the
 * check-in timestamp, the staff member, and a price snapshot so revenue
 * survives future price-list changes.
 */
export async function checkInBooking(
  id: string,
  staffName: string,
  price: number | null,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured" };

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      checked_in_at: new Date().toISOString(),
      checked_in_by: staffName,
      price_rwf: price,
    })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/** Today's confirmed online bookings, ready to be checked in. */
export async function fetchTodayConfirmedMassages(): Promise<StaffBooking[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_date", iso)
    .eq("status", "confirmed")
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as BookingRow[]).map(rowToStaffBooking);
}

/* ------------------------------- Revenue --------------------------------- */

export type RevenueRange = "today" | "week" | "month";

export type RevenueSummary = {
  count: number;
  total: number;
  bySource: { source: "online" | "walk_in"; count: number; total: number }[];
  byService: { name: string; count: number; total: number }[];
  byStaff: { name: string; count: number; total: number }[];
};

function rangeStart(range: RevenueRange, now = new Date()): Date {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return day;
  if (range === "week") {
    // ISO week — Monday start.
    const dow = (day.getDay() + 6) % 7;
    day.setDate(day.getDate() - dow);
    return day;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Revenue for a period. ONLY status='completed' rows count, bucketed by
 * when the session was checked in (checked_in_at) — see OWNER_GUIDE.md.
 */
export async function fetchRevenueSummary(
  range: RevenueRange,
): Promise<RevenueSummary> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("status", "completed")
    .gte("checked_in_at", rangeStart(range).toISOString());
  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as unknown as BookingRow[]).map(rowToStaffBooking);

  const tally = <K extends string>(
    keyOf: (b: StaffBooking) => K,
  ): Map<K, { count: number; total: number }> => {
    const m = new Map<K, { count: number; total: number }>();
    for (const b of rows) {
      const k = keyOf(b);
      const e = m.get(k) ?? { count: 0, total: 0 };
      e.count += 1;
      e.total += b.price ?? 0;
      m.set(k, e);
    }
    return m;
  };

  const bySource = tally((b) => b.source);
  const byService = tally((b) => b.serviceName);
  const byStaff = tally((b) => b.checkedInBy ?? "—");

  const sorted = <T extends { total: number }>(arr: T[]) =>
    arr.sort((a, b) => b.total - a.total);

  return {
    count: rows.length,
    total: rows.reduce((s, b) => s + (b.price ?? 0), 0),
    bySource: (["online", "walk_in"] as const).map((source) => ({
      source,
      count: bySource.get(source)?.count ?? 0,
      total: bySource.get(source)?.total ?? 0,
    })),
    byService: sorted(
      [...byService.entries()].map(([name, e]) => ({ name, ...e })),
    ).slice(0, 5),
    byStaff: sorted([...byStaff.entries()].map(([name, e]) => ({ name, ...e }))),
  };
}

export type UpdateStatusResult =
  | { ok: true }
  | { ok: false; reason: "overlap" | "error"; message?: string };

/**
 * Approve (confirmed) or reject (cancelled) a booking request. Requires a
 * staff session — RLS restricts updates to the authenticated role, and the
 * column grant limits them to the status column.
 *
 * Confirming a time that overlaps an already-confirmed booking fails on the
 * bookings_no_overlap exclusion constraint (code 23P01) — surfaced as
 * "overlap" so the UI can explain it instead of showing a raw error.
 */
export async function updateBookingStatus(
  id: string,
  status: "confirmed" | "cancelled",
): Promise<UpdateStatusResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "error", message: "Supabase is not configured" };

  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) {
    return {
      ok: false,
      reason: error.code === "23P01" ? "overlap" : "error",
      message: error.message,
    };
  }
  return { ok: true };
}

/* ------------------------------- Auth ----------------------------------- */

export async function staffSignIn(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: "Supabase is not configured" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function staffSignOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Subscribe to the auth session. Calls `onSession` immediately with the
 * current session (or null) and again on every sign-in / sign-out.
 * Returns an unsubscribe fn.
 */
export function watchStaffSession(
  onSession: (session: Session | null) => void,
): () => void {
  const supabase = getSupabase();
  if (!supabase) {
    onSession(null);
    return () => {};
  }
  supabase.auth.getSession().then(({ data }) => onSession(data.session));
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    onSession(session);
  });
  return () => sub.subscription.unsubscribe();
}
