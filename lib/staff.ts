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
    createdAt: r.created_at,
    price: resolvePrice(r.service_id, r.service_name),
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
