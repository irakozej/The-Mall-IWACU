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
 *   - Week ahead: today through +7 days, grouped per day (planning view).
 *   - Past: the last PAST_DAYS days, newest first, with a revenue summary.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  AlertCircle,
  CalendarDays,
  History,
  Lock,
  LogOut,
  Phone,
  RefreshCw,
} from "lucide-react";
import {
  fetchStaffBookings,
  staffSignIn,
  staffSignOut,
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

type View = "week" | "past";

function addDays(d: Date, days: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() + days);
  return out;
}

function dayLabel(iso: string, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(
    locale === "rw" ? "rw-RW" : "en-GB",
    { weekday: "long", day: "numeric", month: "long" },
  );
}

export default function StaffDashboard() {
  const t = useT();
  // undefined = still checking storage; null = signed out.
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => watchStaffSession(setSession), []);

  if (!isSupabaseConfigured) {
    return (
      <Panel>
        <AlertCircle size={20} className="text-amber-600 shrink-0" />
        <p className="text-sm text-ink-soft">{t("staff.notConfigured")}</p>
      </Panel>
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

function LoginForm() {
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
        </div>

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
          : t("staff.pastSubtitle", { days: PAST_DAYS })}
      </p>

      {error ? (
        <Panel>
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <p className="text-sm text-ink-soft">{t("staff.fetchError")}</p>
          <button
            type="button"
            onClick={() => load(view)}
            className="ml-auto inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-xs text-ink hover:border-gold transition-colors"
          >
            <RefreshCw size={12} /> {t("staff.retry")}
          </button>
        </Panel>
      ) : bookings === null ? (
        <div className="py-16 text-center text-sm text-ink-mute" role="status">
          {t("staff.loading")}
        </div>
      ) : view === "week" ? (
        <WeekView bookings={bookings} />
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

function WeekView({ bookings }: { bookings: StaffBooking[] }) {
  const t = useT();
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

  return (
    <div className="space-y-10">
      {days.map((iso, i) => {
        const dayBookings = byDate.get(iso) ?? [];
        return (
          <section key={iso}>
            <h2 className="flex items-baseline gap-3 font-display text-2xl text-forest">
              <DayHeading iso={iso} />
              {i === 0 ? (
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold-deep font-sans">
                  {t("staff.today")}
                </span>
              ) : null}
            </h2>
            {dayBookings.length === 0 ? (
              <p className="mt-3 text-sm text-ink-mute">{t("staff.empty")}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {dayBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function DayHeading({ iso }: { iso: string }) {
  const { locale } = useLocale();
  return <>{dayLabel(iso, locale)}</>;
}

/* ----------------------------- Past view -------------------------------- */

function PastView({ bookings }: { bookings: StaffBooking[] }) {
  const t = useT();
  const newestFirst = useMemo(() => [...bookings].reverse(), [bookings]);

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const revenue = confirmed.reduce((sum, b) => sum + (b.price ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
        <Stat label={t("staff.summary.total")} value={String(bookings.length)} />
        <Stat label={t("staff.summary.confirmed")} value={String(confirmed.length)} />
        <Stat label={t("staff.summary.revenue")} value={formatPriceRWF(revenue)} />
      </div>

      {newestFirst.length === 0 ? (
        <p className="text-sm text-ink-mute">{t("staff.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {newestFirst.map((b) => (
            <BookingCard key={b.id} booking={b} showDate />
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream-warm border border-ink/10 px-4 py-3">
      <div className="text-[10px] tracking-[0.25em] uppercase text-ink-mute">
        {label}
      </div>
      <div className="mt-1 font-display text-xl text-forest tabular-nums">
        {value}
      </div>
    </div>
  );
}

/* ---------------------------- Booking card ------------------------------ */

function BookingCard({
  booking: b,
  showDate = false,
}: {
  booking: StaffBooking;
  showDate?: boolean;
}) {
  const t = useT();
  const cancelled = b.status === "cancelled";
  return (
    <li
      className={[
        "bg-cream-warm border border-ink/10 px-4 py-3 sm:px-5",
        cancelled ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-display text-lg text-forest tabular-nums">
          {showDate ? `${b.date} · ` : ""}
          {b.startTime} — {b.endTime}
        </span>
        <span className={["text-sm", cancelled ? "line-through" : "text-ink"].join(" ")}>
          {b.serviceName}
        </span>
        <span className="text-sm text-ink-mute">
          {b.durationMin} {t("book.minutes")}
        </span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-sm font-medium text-forest tabular-nums">
            {b.price !== null ? formatPriceRWF(b.price) : "—"}
          </span>
          <StatusBadge status={b.status} />
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
        <span>{b.customerName}</span>
        {b.customerPhone ? (
          <a
            href={`tel:${b.customerPhone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 hover:text-gold-deep transition-colors tabular-nums"
          >
            <Phone size={12} className="text-gold" /> {b.customerPhone}
          </a>
        ) : null}
        {b.customerNotes ? (
          <span className="text-ink-mute italic">{b.customerNotes}</span>
        ) : null}
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: StaffBooking["status"] }) {
  const t = useT();
  const style =
    status === "confirmed"
      ? "bg-emerald-100 text-emerald-900 border-emerald-600/30"
      : status === "pending"
        ? "bg-amber-50 text-amber-900 border-amber-600/30"
        : "bg-ink/5 text-ink-mute border-ink/15";
  return (
    <span
      className={[
        "border px-2 py-0.5 text-[10px] tracking-[0.2em] uppercase",
        style,
      ].join(" ")}
    >
      {t(`staff.status.${status}`)}
    </span>
  );
}

/* ------------------------------- Shared --------------------------------- */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border border-amber-600/40 bg-amber-50 px-5 py-4">
      {children}
    </div>
  );
}
