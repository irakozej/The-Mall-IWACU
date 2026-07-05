"use client";

/**
 * Staff-only bookings dashboard (/staff).
 *
 * Auth is Supabase email+password — accounts are created by the owner from
 * the Supabase dashboard (Authentication → Users), sign-ups stay disabled.
 * RLS gives the authenticated role full row access (including customer
 * details and cancelled rows) while anonymous visitors can only read the
 * availability columns — see supabase/schema.sql §4b.
 *
 * Two views:
 *   - Week ahead: today through +7 days, one card per day (planning view),
 *     with Approve/Reject controls on pending requests — approval is what
 *     locks a slot for the public booking page; rejection frees it.
 *   - Past: the last PAST_DAYS days grouped by month, with status filters
 *     and a per-service breakdown (sessions + revenue).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  Check,
  History,
  Lock,
  LogOut,
  Phone,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";
import RevenueTab from "./RevenueTab";
import {
  fetchStaffBookings,
  staffSignIn,
  staffSignOut,
  updateBookingStatus,
  watchStaffSession,
  type StaffBooking,
} from "@/lib/staff";
import {
  formatPriceRWF,
  isSupabaseConfigured,
  subscribeBookings,
  toDateString,
} from "@/lib/booking";
import { useLocale, useT } from "@/lib/i18n";

const PAST_DAYS = 60;
const WEEK_DAYS = 7;

type View = "week" | "past" | "revenue";
type StatusFilter = "all" | StaffBooking["status"];

function addDays(d: Date, days: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() + days);
  return out;
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function localeTag(locale: string): string {
  return locale === "rw" ? "rw-RW" : "en-GB";
}

export default function StaffDashboard() {
  const t = useT();
  // undefined = still checking storage; null = signed out.
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => watchStaffSession(setSession), []);

  if (!isSupabaseConfigured) {
    return (
      <Notice>
        <AlertCircle size={20} className="text-amber-600 shrink-0" />
        <p className="text-sm text-ink-soft">{t("staff.notConfigured")}</p>
      </Notice>
    );
  }

  if (session === undefined) {
    return (
      <div className="py-16 text-center text-sm text-ink-mute" role="status">
        {t("staff.loading")}
      </div>
    );
  }

  return session ? <Dashboard session={session} /> : <LoginForm />;
}

/* ------------------------------- Login ---------------------------------- */

// Exported for /staff/check-in, which shares the same auth gate.
export function LoginForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const result = await staffSignIn(email.trim(), password);
    if (!result.ok) {
      setError(true);
      setBusy(false);
    }
    // On success watchStaffSession flips the page to the dashboard.
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-sm bg-cream-warm border border-ink/10 p-6 sm:p-8 space-y-5"
    >
      <div className="flex items-center gap-2 text-forest">
        <Lock size={16} className="text-gold" />
        <span className="text-[11px] tracking-[0.3em] uppercase">
          {t("staff.login.title")}
        </span>
      </div>

      <div>
        <label
          htmlFor="staff-email"
          className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2"
        >
          {t("staff.login.email")}
        </label>
        <input
          id="staff-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-cream border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="staff-password"
          className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2"
        >
          {t("staff.login.password")}
        </label>
        <input
          id="staff-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-cream border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors"
        />
      </div>

      {error ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-amber-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-700" />
          {t("staff.login.error")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 bg-forest text-cream px-5 py-3 text-sm hover:bg-forest-deep transition-colors disabled:opacity-60"
      >
        {busy ? (
          <>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-cream/40 border-t-cream animate-spin" />
            {t("staff.login.signingIn")}
          </>
        ) : (
          t("staff.login.submit")
        )}
      </button>
    </form>
  );
}

/* ----------------------------- Dashboard -------------------------------- */

function Dashboard({ session }: { session: Session }) {
  const t = useT();
  const [view, setView] = useState<View>("week");
  const [bookings, setBookings] = useState<StaffBooking[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async (which: View) => {
    setError(false);
    const today = new Date();
    const from =
      which === "week" ? toDateString(today) : toDateString(addDays(today, -PAST_DAYS));
    const to =
      which === "week"
        ? toDateString(addDays(today, WEEK_DAYS))
        : toDateString(addDays(today, -1));
    try {
      setBookings(await fetchStaffBookings(from, to));
    } catch {
      setBookings(null);
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (view === "revenue") return; // RevenueTab does its own fetching.
    setBookings(null);
    load(view);
    // Live refresh whenever any booking changes.
    const unsub = subscribeBookings(() => load(view));
    return unsub;
  }, [view, load]);

  return (
    <div className="space-y-8">
      {/* Toolbar: view toggle + account */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border border-ink/15">
          <ViewTab
            active={view === "week"}
            onClick={() => setView("week")}
            icon={<CalendarDays size={14} />}
            label={t("staff.views.week")}
          />
          <ViewTab
            active={view === "past"}
            onClick={() => setView("past")}
            icon={<History size={14} />}
            label={t("staff.views.past")}
          />
          <ViewTab
            active={view === "revenue"}
            onClick={() => setView("revenue")}
            icon={<Banknote size={14} />}
            label={t("staff.views.revenue")}
          />
        </div>

        <Link
          href="/staff/check-in"
          className="inline-flex items-center gap-1.5 bg-forest text-cream px-4 py-2.5 text-xs tracking-wide hover:bg-forest-deep transition-colors"
        >
          <UserPlus size={13} /> {t("checkIn.link")}
        </Link>

        <div className="ml-auto flex items-center gap-4 text-xs text-ink-mute">
          <span className="hidden sm:inline">
            {t("staff.signedInAs")}{" "}
            <span className="text-ink">{session.user.email}</span>
          </span>
          <button
            type="button"
            onClick={() => staffSignOut()}
            className="inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-ink hover:border-gold transition-colors"
          >
            <LogOut size={13} /> {t("staff.signOut")}
          </button>
        </div>
      </div>

      <p className="text-sm text-ink-soft">
        {view === "week"
          ? t("staff.weekSubtitle")
          : view === "past"
            ? t("staff.pastSubtitle", { days: PAST_DAYS })
            : t("revenue.subtitle")}
      </p>

      {view === "revenue" ? (
        <RevenueTab />
      ) : error ? (
        <Notice>
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <p className="text-sm text-ink-soft">{t("staff.fetchError")}</p>
          <button
            type="button"
            onClick={() => load(view)}
            className="ml-auto inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-xs text-ink hover:border-gold transition-colors"
          >
            <RefreshCw size={12} /> {t("staff.retry")}
          </button>
        </Notice>
      ) : bookings === null ? (
        <div className="py-16 text-center text-sm text-ink-mute" role="status">
          {t("staff.loading")}
        </div>
      ) : view === "week" ? (
        <WeekView bookings={bookings} onChanged={() => load(view)} />
      ) : (
        <PastView bookings={bookings} />
      )}
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex items-center gap-2 px-4 py-2.5 text-xs tracking-wide transition-colors",
        active
          ? "bg-forest text-cream"
          : "bg-cream-warm text-ink hover:text-gold-deep",
      ].join(" ")}
    >
      {icon} {label}
    </button>
  );
}

/* ----------------------------- Week view -------------------------------- */

function WeekView({
  bookings,
  onChanged,
}: {
  bookings: StaffBooking[];
  onChanged: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: WEEK_DAYS + 1 }, (_, i) =>
      toDateString(addDays(today, i)),
    );
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, StaffBooking[]>();
    for (const b of bookings) {
      map.set(b.date, [...(map.get(b.date) ?? []), b]);
    }
    return map;
  }, [bookings]);

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Week at a glance */}
      <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
        <Stat label={t("staff.summary.total")} value={String(bookings.length)} />
        <Stat label={t("staff.status.confirmed")} value={String(confirmed)} accent="confirmed" />
        <Stat label={t("staff.status.pending")} value={String(pending)} accent="pending" />
      </div>

      <div className="space-y-5">
        {days.map((iso, i) => {
          const dayBookings = byDate.get(iso) ?? [];
          const isToday = i === 0;
          const dayRevenue = dayBookings
            .filter((b) => b.status === "confirmed")
            .reduce((sum, b) => sum + (b.price ?? 0), 0);
          return (
            <section
              key={iso}
              className={[
                "border bg-cream-warm/50",
                isToday ? "border-gold/60" : "border-ink/10",
              ].join(" ")}
            >
              <header
                className={[
                  "flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 sm:px-5 py-3 border-b",
                  isToday ? "border-gold/40 bg-gold/10" : "border-ink/10",
                ].join(" ")}
              >
                <h2 className="font-display text-xl text-forest capitalize">
                  {isoToDate(iso).toLocaleDateString(localeTag(locale), {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
                {isToday ? (
                  <span className="text-[10px] tracking-[0.3em] uppercase text-gold-deep">
                    {t("staff.today")}
                  </span>
                ) : null}
                <span className="ml-auto text-xs text-ink-mute tabular-nums">
                  {dayBookings.length > 0
                    ? t("staff.dayCount", { n: dayBookings.length })
                    : t("staff.empty")}
                  {dayRevenue > 0 ? ` · ${formatPriceRWF(dayRevenue)}` : ""}
                </span>
              </header>
              {dayBookings.length > 0 ? (
                <ul className="divide-y divide-ink/10">
                  {dayBookings.map((b) => (
                    <BookingRow key={b.id} booking={b} onChanged={onChanged} />
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- Past view -------------------------------- */

function PastView({ bookings }: { bookings: StaffBooking[] }) {
  const t = useT();
  const { locale } = useLocale();
  const [filter, setFilter] = useState<StatusFilter>("all");

  // Sessions with revenue value: checked-in (completed) plus confirmed ones
  // that were never checked in. The Revenue tab is the strict source of truth
  // (completed only); this stat is the looser historical view.
  const done = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "confirmed" || b.status === "completed",
      ),
    [bookings],
  );
  const revenue = done.reduce((sum, b) => sum + (b.price ?? 0), 0);

  // Per-service breakdown — biggest earner first.
  const byService = useMemo(() => {
    const map = new Map<string, { name: string; count: number; revenue: number }>();
    for (const b of done) {
      const key = b.serviceId ?? b.serviceName;
      const entry = map.get(key) ?? { name: b.serviceName, count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += b.price ?? 0;
      map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [done]);

  const counts: Record<StatusFilter, number> = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const filtered = useMemo(() => {
    const list = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
    return [...list].reverse(); // newest first
  }, [bookings, filter]);

  // Group by month for scannability over a 60-day window.
  const months = useMemo(() => {
    const out: { label: string; items: StaffBooking[] }[] = [];
    for (const b of filtered) {
      const label = isoToDate(b.date).toLocaleDateString(localeTag(locale), {
        month: "long",
        year: "numeric",
      });
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(b);
      else out.push({ label, items: [b] });
    }
    return out;
  }, [filtered, locale]);

  return (
    <div className="space-y-10">
      {/* Totals */}
      <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
        <Stat label={t("staff.summary.total")} value={String(bookings.length)} />
        <Stat
          label={t("staff.status.completed")}
          value={String(counts.completed)}
          accent="confirmed"
        />
        <Stat label={t("staff.summary.revenue")} value={formatPriceRWF(revenue)} />
      </div>

      {/* Per-service breakdown */}
      {byService.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl text-forest">
            {t("staff.byService")}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{t("staff.byServiceSubtitle")}</p>
          <div className="mt-4 border border-ink/10 bg-cream-warm/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-[10px] tracking-[0.25em] uppercase text-ink-mute">
                  <th className="text-left font-normal px-4 sm:px-5 py-2.5">
                    {t("staff.serviceCol")}
                  </th>
                  <th className="text-right font-normal px-4 py-2.5">
                    {t("staff.sessions")}
                  </th>
                  <th className="text-right font-normal px-4 sm:px-5 py-2.5">
                    {t("staff.summary.revenue")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {byService.map((s) => (
                  <tr key={s.name}>
                    <td className="px-4 sm:px-5 py-2.5 text-ink">{s.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-soft">
                      {s.count}
                    </td>
                    <td className="px-4 sm:px-5 py-2.5 text-right tabular-nums text-forest font-medium">
                      {formatPriceRWF(s.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* History list with status filter */}
      <section>
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "completed", "confirmed", "pending", "cancelled"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
              className={[
                "px-3 py-1.5 text-xs border transition-colors tabular-nums",
                filter === s
                  ? "bg-forest text-cream border-forest"
                  : "bg-cream-warm text-ink border-ink/15 hover:border-gold",
              ].join(" ")}
            >
              {s === "all" ? t("staff.filterAll") : t(`staff.status.${s}`)} · {counts[s]}
            </button>
          ))}
        </div>

        {months.length === 0 ? (
          <p className="mt-6 text-sm text-ink-mute">{t("staff.empty")}</p>
        ) : (
          <div className="mt-6 space-y-8">
            {months.map((m) => (
              <div key={m.label}>
                <h3 className="font-display text-xl text-forest capitalize">
                  {m.label}
                </h3>
                <ul className="mt-3 border border-ink/10 bg-cream-warm/50 divide-y divide-ink/10">
                  {m.items.map((b) => (
                    <BookingRow key={b.id} booking={b} showDate />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "confirmed" | "pending";
}) {
  const bar =
    accent === "confirmed"
      ? "bg-emerald-600"
      : accent === "pending"
        ? "bg-amber-500"
        : "bg-gold";
  return (
    <div className="relative bg-cream-warm border border-ink/10 px-4 py-3 overflow-hidden">
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${bar}`} aria-hidden />
      <div className="text-[10px] tracking-[0.25em] uppercase text-ink-mute">
        {label}
      </div>
      <div className="mt-1 font-display text-xl text-forest tabular-nums">
        {value}
      </div>
    </div>
  );
}

/* ---------------------------- Booking row ------------------------------- */

function BookingRow({
  booking: b,
  showDate = false,
  onChanged,
}: {
  booking: StaffBooking;
  showDate?: boolean;
  // When provided and the row is pending, Approve/Reject buttons appear.
  onChanged?: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const status = b.status;
  const dimmed = status === "cancelled";

  const edge =
    status === "confirmed"
      ? "border-l-emerald-600"
      : status === "completed"
        ? "border-l-forest"
        : status === "pending"
          ? "border-l-amber-500"
          : "border-l-ink/20";

  return (
    <li
      className={[
        "relative border-l-[3px] px-4 sm:px-5 py-3",
        edge,
        dimmed ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        {/* Time block */}
        <div className="w-32 shrink-0">
          {showDate ? (
            <div className="text-[11px] text-ink-mute capitalize">
              {isoToDate(b.date).toLocaleDateString(localeTag(locale), {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </div>
          ) : null}
          <div className="font-display text-lg text-forest tabular-nums leading-tight">
            {b.startTime} — {b.endTime}
          </div>
          <div className="text-[11px] text-ink-mute">
            {b.durationMin} {t("book.minutes")}
          </div>
        </div>

        {/* Service + customer */}
        <div className="min-w-0 flex-1 basis-52">
          <div
            className={[
              "text-sm font-medium",
              status === "cancelled" ? "line-through text-ink-soft" : "text-ink",
            ].join(" ")}
          >
            {b.serviceName}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-ink-soft">
            <span>{b.customerName}</span>
            {b.customerPhone ? (
              <a
                href={`tel:${b.customerPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1 hover:text-gold-deep transition-colors tabular-nums"
              >
                <Phone size={11} className="text-gold" /> {b.customerPhone}
              </a>
            ) : null}
          </div>
          {b.customerNotes ? (
            <p className="mt-0.5 text-xs italic text-ink-mute">{b.customerNotes}</p>
          ) : null}
        </div>

        {/* Price + status */}
        <div className="ml-auto text-right shrink-0">
          <div className="text-sm font-medium text-forest tabular-nums">
            {b.price !== null ? formatPriceRWF(b.price) : "—"}
          </div>
          <div className="mt-1">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {status === "pending" && onChanged ? (
        <RowActions booking={b} onChanged={onChanged} />
      ) : null}
    </li>
  );
}

/**
 * Approve / Reject controls for a pending request. Approving locks the time
 * for everyone (the public page greys it out within ~1s via realtime);
 * rejecting frees it. If the time was meanwhile approved for someone else,
 * the database refuses the overlap and we explain why.
 */
function RowActions({
  booking: b,
  onChanged,
}: {
  booking: StaffBooking;
  onChanged: () => void;
}) {
  const t = useT();
  const [busy, setBusy] = useState<"confirmed" | "cancelled" | null>(null);
  const [error, setError] = useState<"overlap" | "error" | null>(null);

  async function act(status: "confirmed" | "cancelled") {
    setBusy(status);
    setError(null);
    const result = await updateBookingStatus(b.id, status);
    if (!result.ok) {
      setError(result.reason);
      setBusy(null);
      return;
    }
    onChanged();
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => act("confirmed")}
        className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 text-xs hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {busy === "confirmed" ? (
          <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : (
          <Check size={13} />
        )}
        {t("staff.actions.approve")}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => act("cancelled")}
        className="inline-flex items-center gap-1.5 border border-ink/20 text-ink px-4 py-2 text-xs hover:border-red-500 hover:text-red-700 transition-colors disabled:opacity-60"
      >
        {busy === "cancelled" ? (
          <span className="w-3 h-3 rounded-full border-2 border-ink/30 border-t-ink animate-spin" />
        ) : (
          <X size={13} />
        )}
        {t("staff.actions.reject")}
      </button>
      {error ? (
        <p role="alert" className="basis-full sm:basis-auto text-xs text-amber-900">
          {error === "overlap"
            ? t("staff.actions.overlap")
            : t("staff.actions.error")}
        </p>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: StaffBooking["status"] }) {
  const t = useT();
  const style =
    status === "confirmed"
      ? "bg-emerald-100 text-emerald-900 border-emerald-600/30"
      : status === "completed"
        ? "bg-forest/10 text-forest border-forest/30"
        : status === "pending"
          ? "bg-amber-50 text-amber-900 border-amber-600/30"
          : "bg-ink/5 text-ink-mute border-ink/15";
  return (
    <span
      className={[
        "inline-block border px-2 py-0.5 text-[10px] tracking-[0.2em] uppercase",
        style,
      ].join(" ")}
    >
      {t(`staff.status.${status}`)}
    </span>
  );
}

/* ------------------------------- Shared --------------------------------- */

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border border-amber-600/40 bg-amber-50 px-5 py-4">
      {children}
    </div>
  );
}
