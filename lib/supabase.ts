import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// We intentionally use an un-typed client. Hand-rolling the generated
// Database type was fighting TypeScript on every `.select(...)` projection.
// Local TS types on the call sites give us the same safety where it matters.

// Public-by-design: the anon key is meant to be shipped to the browser.
// Row-Level Security (see supabase/schema.sql) is what actually protects writes.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Booking row shape — must match the columns in `supabase/schema.sql`.
 */
export type BookingRow = {
  id: string;
  created_at: string;
  booking_date: string;     // "YYYY-MM-DD"
  start_time: string;       // "HH:MM:SS"
  duration_min: number;
  service_id: string | null;
  service_name: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_notes: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  source: "online" | "walk_in";
  checked_in_at: string | null;
  checked_in_by: string | null;
  price_rwf: number | null;
};

/**
 * Singleton — null when env vars are missing so the rest of the app can
 * gracefully fall back to the local JSON file.
 */
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!url || !anonKey) {
    client = null;
    return null;
  }
  // persistSession keeps the staff login (/staff) alive across reloads.
  // Anonymous visitors never sign in, so nothing is stored for them.
  client = createClient(url, anonKey, {
    auth: { persistSession: true },
  });
  return client;
}

export const isSupabaseConfigured = Boolean(url && anonKey);
