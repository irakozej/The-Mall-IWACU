"use client";

/**
 * "Check in booking" — Tab B of /staff/check-in.
 *
 * Lists today's CONFIRMED online bookings; one tap marks the session done
 * (status → completed, with timestamp, staff name and price snapshot), which
 * is what makes it count as revenue. The staff member picks their name once —
 * it's remembered for the session (shared with the walk-in form).
 */

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Phone, RefreshCw } from "lucide-react";
import {
  checkInBooking,
  fetchTodayConfirmedMassages,
  type StaffBooking,
} from "@/lib/staff";
import { formatPriceRWF, subscribeBookings } from "@/lib/booking";
import { useT } from "@/lib/i18n";
import {
  recallStaffName,
  rememberStaffName,
  staffMembers,
} from "./WalkInForm";

export default function CheckInList() {
  const t = useT();
  const [bookings, setBookings] = useState<StaffBooking[] | null>(null);
  const [staffName, setStaffName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [justDone, setJustDone] = useState<string | null>(null);

  useEffect(() => setStaffName(recallStaffName()), []);

  const load = useCallback(async () => {
    setError(false);
    try {
      setBookings(await fetchTodayConfirmedMassages());
    } catch {
      setBookings(null);
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const unsub = subscribeBookings(() => load());
    return unsub;
  }, [load]);

  async function onCheckIn(b: StaffBooking) {
    if (!staffName) return;
    setBusyId(b.id);
    setError(false);
    const result = await checkInBooking(b.id, staffName, b.price);
    setBusyId(null);
    if (!result.ok) {
      setError(true);
      return;
    }
    setJustDone(b.id);
    window.setTimeout(() => setJustDone(null), 2500);
    load();
  }

  return (
    <div className="space-y-5">
      {/* Staff identity — asked once, remembered for the session */}
      <div className="max-w-xs">
        <label
          htmlFor="ci-staff"
          className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2"
        >
          {t("checkIn.staffMember")}
        </label>
        <select
          id="ci-staff"
          value={staffName}
          onChange={(e) => {
            setStaffName(e.target.value);
            rememberStaffName(e.target.value);
          }}
          className="w-full bg-cream-warm border border-ink/15 px-4 py-3.5 text-base focus:border-gold focus:outline-none transition-colors"
        >
          <option value="" disabled>
            {t("checkIn.staffMemberPlaceholder")}
          </option>
          {staffMembers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="flex items-center gap-3 border border-amber-600/40 bg-amber-50 px-4 py-3 text-sm text-ink-soft">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          {t("checkIn.error")}
          <button
            type="button"
            onClick={load}
            className="ml-auto inline-flex items-center gap-1.5 border border-ink/15 px-3 py-1.5 text-xs text-ink hover:border-gold transition-colors"
          >
            <RefreshCw size={12} /> {t("staff.retry")}
          </button>
        </div>
      ) : bookings === null ? (
        <p className="py-10 text-center text-sm text-ink-mute" role="status">
          {t("staff.loading")}
        </p>
      ) : bookings.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-mute">
          {t("checkIn.list.empty")}
        </p>
      ) : (
        <ul className="border border-ink/10 bg-cream-warm/50 divide-y divide-ink/10">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-3.5"
            >
              <span className="font-display text-lg text-forest tabular-nums w-14 shrink-0">
                {b.startTime}
              </span>
              <span className="min-w-0 flex-1 basis-40">
                <span className="block text-sm font-medium text-ink">
                  {b.customerName}
                </span>
                <span className="block text-xs text-ink-soft">
                  {b.serviceName} · {b.durationMin} {t("book.minutes")}
                  {b.customerPhone ? (
                    <a
                      href={`tel:${b.customerPhone.replace(/\s/g, "")}`}
                      className="ml-2 inline-flex items-center gap-1 hover:text-gold-deep tabular-nums"
                    >
                      <Phone size={10} className="text-gold" />
                      {b.customerPhone}
                    </a>
                  ) : null}
                </span>
              </span>
              <span className="text-sm font-medium text-forest tabular-nums">
                {b.price !== null ? formatPriceRWF(b.price) : "—"}
              </span>
              {justDone === b.id ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 text-sm">
                  <CheckCircle2 size={18} /> {t("checkIn.list.done")}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={!staffName || busyId !== null}
                  onClick={() => onCheckIn(b)}
                  title={!staffName ? t("checkIn.staffMemberPlaceholder") : undefined}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busyId === b.id ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  {t("checkIn.list.checkIn")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
