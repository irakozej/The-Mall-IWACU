import servicesData from "@/data/services.json";
import bookingsData from "@/data/bookings.json";
import {
  getSupabase,
  isSupabaseConfigured,
  PENDING_EXPIRY_MIN,
  type BookingRow,
} from "./supabase";

export type Service = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  featured?: boolean;
};

export type Booking = {
  date: string;          // ISO YYYY-MM-DD
  startTime: string;     // HH:MM (24-hour)
  durationMin: number;
};

export type BookingConfig = {
  workingHours: { open: string; close: string };
  slotIncrementMin: number;
  leadTimeMin: number;
  maxDaysAhead: number;
  services: Service[];
};

export const config: BookingConfig = servicesData as BookingConfig;
export const bookings: Booking[] = (bookingsData as { bookings: Booking[] }).bookings;

export type Slot = {
  start: string;   // HH:MM
  end: string;     // HH:MM
  startMin: number;
  endMin: number;
  available: boolean;
  reason?: "booked" | "past" | "lead-time";
};

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function generateDateOptions(maxDaysAhead: number, from = new Date()): Date[] {
  const out: Date[] = [];
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i <= maxDaysAhead; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d);
  }
  return out;
}

export function generateSlots(
  date: string,
  durationMin: number,
  allBookings: Booking[],
  cfg: BookingConfig,
  now: Date = new Date(),
): Slot[] {
  const openMin = timeToMinutes(cfg.workingHours.open);
  const closeMin = timeToMinutes(cfg.workingHours.close);
  const todayStr = toDateString(now);
  const isToday = date === todayStr;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const dateBookings = allBookings.filter((b) => b.date === date);

  const slots: Slot[] = [];
  for (let m = openMin; m + durationMin <= closeMin; m += cfg.slotIncrementMin) {
    const endM = m + durationMin;

    let available = true;
    let reason: Slot["reason"] | undefined;

    // Past or too-soon check for today
    if (isToday && m < nowMin + cfg.leadTimeMin) {
      available = false;
      reason = m < nowMin ? "past" : "lead-time";
    }

    // Overlap with confirmed bookings
    if (available) {
      const overlap = dateBookings.some((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = bStart + b.durationMin;
        return m < bEnd && endM > bStart;
      });
      if (overlap) {
        available = false;
        reason = "booked";
      }
    }

    slots.push({
      start: minutesToTime(m),
      end: minutesToTime(endM),
      startMin: m,
      endMin: endM,
      available,
      reason,
    });
  }
  return slots;
}

export function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatPriceRWF(p: number): string {
  return `${p.toLocaleString("en-US")} RWF`;
}

/* ----------------------------------------------------------------------- */
/*                              Supabase layer                              */
/* ----------------------------------------------------------------------- */

export { isSupabaseConfigured };

function rowToBooking(r: Pick<BookingRow, "booking_date" | "start_time" | "duration_min">): Booking {
  return {
    date: r.booking_date,
    // Postgres TIME returns "HH:MM:SS" — strip the seconds for UI consistency.
    startTime: r.start_time.slice(0, 5),
    durationMin: r.duration_min,
  };
}

/**
 * Fetch the bookings that should block slots:
 *  - all `confirmed` rows
 *  - `pending` rows created in the last PENDING_EXPIRY_MIN minutes
 *
 * Falls back to the static JSON when Supabase isn't configured.
 */
export async function fetchBookings(): Promise<Booking[]> {
  const supabase = getSupabase();
  if (!supabase) return bookings;

  const cutoff = new Date(Date.now() - PENDING_EXPIRY_MIN * 60_000).toISOString();
  const { data, error } = await supabase
    .from("bookings")
    .select("booking_date, start_time, duration_min, status, created_at")
    .neq("status", "cancelled");

  if (error || !data) {
    if (typeof console !== "undefined") {
      console.warn("[booking] fetchBookings failed, falling back to JSON:", error?.message);
    }
    return bookings;
  }

  type FetchRow = Pick<
    BookingRow,
    "booking_date" | "start_time" | "duration_min" | "status" | "created_at"
  >;
  const rows = data as unknown as FetchRow[];

  return rows
    .filter((r) =>
      r.status === "confirmed" ||
      (r.status === "pending" && r.created_at > cutoff),
    )
    .map(rowToBooking);
}

export type CreateBookingInput = {
  date: string;            // YYYY-MM-DD
  startTime: string;       // HH:MM
  durationMin: number;
  serviceId?: string;
  serviceName?: string;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
};

export type CreateBookingResult =
  | { ok: true; mode: "supabase" | "local" }
  | { ok: false; reason: "slot-taken" | "supabase-error"; message?: string };

/**
 * Insert a `pending` booking. The page subscribes to the same table over the
 * realtime channel, so every open BookingForm gets the new row within ~1s and
 * the slot greys out for everyone.
 *
 * Conflict handling: we re-query for any existing pending/confirmed row that
 * overlaps the requested window. There's still a tiny race between the check
 * and the insert; we treat that the same as "slot-taken" by surfacing the
 * postgres error. For atomic protection, the schema also defines an exclusion
 * constraint (see supabase/schema.sql).
 */
export async function createPendingBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: true, mode: "local" };

  const startSec = `${input.startTime}:00`;

  // Soft race check first — gives a nicer error than a raw constraint violation.
  const cutoff = new Date(Date.now() - PENDING_EXPIRY_MIN * 60_000).toISOString();
  const { data: existing, error: checkError } = await supabase
    .from("bookings")
    .select("id, status, created_at, start_time, duration_min")
    .eq("booking_date", input.date)
    .neq("status", "cancelled");

  if (checkError) {
    return { ok: false, reason: "supabase-error", message: checkError.message };
  }

  if (existing && existing.length > 0) {
    type CheckRow = Pick<
      BookingRow,
      "status" | "created_at" | "start_time" | "duration_min"
    >;
    const rows = existing as unknown as CheckRow[];
    const reqStart = timeToMinutes(input.startTime);
    const reqEnd = reqStart + input.durationMin;
    const conflict = rows.some((r) => {
      if (r.status === "pending" && r.created_at <= cutoff) return false;
      const eStart = timeToMinutes(r.start_time.slice(0, 5));
      const eEnd = eStart + r.duration_min;
      return reqStart < eEnd && reqEnd > eStart;
    });
    if (conflict) return { ok: false, reason: "slot-taken" };
  }

  const { error } = await supabase.from("bookings").insert({
    booking_date: input.date,
    start_time: startSec,
    duration_min: input.durationMin,
    service_id: input.serviceId ?? null,
    service_name: input.serviceName ?? null,
    customer_name: input.customerName ?? null,
    customer_phone: input.customerPhone ?? null,
    customer_notes: input.customerNotes ?? null,
  });

  if (error) {
    // Could be the exclusion constraint firing — treat as slot-taken.
    if (error.code === "23P01" || error.code === "23505") {
      return { ok: false, reason: "slot-taken" };
    }
    return { ok: false, reason: "supabase-error", message: error.message };
  }

  return { ok: true, mode: "supabase" };
}

/**
 * Subscribe to live changes on the bookings table. Returns an unsubscribe fn.
 */
export function subscribeBookings(onChange: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel("bookings-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookings" },
      () => onChange(),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
