import servicesData from "@/data/services.json";
import bookingsData from "@/data/bookings.json";

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
