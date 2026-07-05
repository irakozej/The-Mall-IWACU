"use client";

/**
 * Walk-in logging — Tab A of /staff/check-in.
 *
 * One screen, minimal typing, phone-sized tap targets. Submitting inserts a
 * COMPLETED walk-in booking (source='walk_in') with a check-in timestamp,
 * the staff member's name, and a price snapshot — it counts as revenue
 * immediately (see OWNER_GUIDE.md).
 */

import { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import staffData from "@/data/staff.json";
import { config, formatPriceRWF, toDateString } from "@/lib/booking";
import { createWalkIn } from "@/lib/staff";
import { useT } from "@/lib/i18n";

export const STAFF_NAME_KEY = "themalliwacu:staff-name:v1";
export const staffMembers: string[] = (staffData as { members: string[] }).members;

export function rememberStaffName(name: string): void {
  try {
    window.sessionStorage.setItem(STAFF_NAME_KEY, name);
  } catch {
    // ignore
  }
}

export function recallStaffName(): string {
  try {
    return window.sessionStorage.getItem(STAFF_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Now, rounded to the nearest 15 minutes, clamped to working hours. */
function defaultTime(): string {
  const now = new Date();
  let mins = now.getHours() * 60 + Math.round(now.getMinutes() / 15) * 15;
  const [oh, om] = config.workingHours.open.split(":").map(Number);
  const [ch, cm] = config.workingHours.close.split(":").map(Number);
  mins = Math.max(oh * 60 + om, Math.min(ch * 60 + cm, mins));
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

export default function WalkInForm() {
  const t = useT();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [time, setTime] = useState(defaultTime);
  const [staffName, setStaffName] = useState(recallStaffName);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState(false);

  const service = config.services.find((s) => s.id === serviceId) ?? null;
  const canSubmit =
    name.trim().length >= 2 && service && time && staffName && status === "idle";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !service) return;
    setStatus("saving");
    setError(false);
    rememberStaffName(staffName);
    const result = await createWalkIn({
      customerName: name.trim(),
      customerPhone: phone.trim() || undefined,
      serviceId: service.id,
      serviceName: service.name,
      durationMin: service.durationMin,
      price: service.price,
      date: toDateString(new Date()),
      startTime: time,
      staffName,
      notes: notes.trim() || undefined,
    });
    if (!result.ok) {
      setError(true);
      setStatus("idle");
      return;
    }
    setStatus("done");
  }

  function reset() {
    setName("");
    setPhone("");
    setServiceId(null);
    setTime(defaultTime());
    setNotes("");
    setStatus("idle");
    setError(false);
    // staffName intentionally kept — same person logs several walk-ins.
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className="border border-emerald-600/30 bg-emerald-50 px-6 py-10 text-center"
      >
        <CheckCircle2 size={64} className="mx-auto text-emerald-600" />
        <p className="mt-4 font-display text-2xl sm:text-3xl text-forest">
          {t("checkIn.walkIn.successHeading")}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {t("checkIn.walkIn.successBody")}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 bg-forest text-cream px-8 py-4 text-base hover:bg-forest-deep transition-colors"
        >
          {t("checkIn.walkIn.addAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="w-name" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
            {t("checkIn.walkIn.name")}
          </label>
          <input
            id="w-name"
            required
            maxLength={120}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-cream-warm border border-ink/15 px-4 py-3.5 text-base focus:border-gold focus:outline-none transition-colors"
            placeholder={t("checkIn.walkIn.namePlaceholder")}
          />
        </div>
        <div>
          <label htmlFor="w-phone" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
            {t("checkIn.walkIn.phone")}{" "}
            <span className="text-ink-mute lowercase tracking-normal text-xs">
              {t("book.step4.optional")}
            </span>
          </label>
          <input
            id="w-phone"
            type="tel"
            maxLength={32}
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-cream-warm border border-ink/15 px-4 py-3.5 text-base focus:border-gold focus:outline-none transition-colors"
            placeholder="+250 7XX XXX XXX"
          />
        </div>
      </div>

      {/* Service picker — tap targets, same pattern as the public booking form */}
      <div>
        <p className="text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
          {t("checkIn.walkIn.service")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {config.services.map((s) => {
            const active = serviceId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={[
                  "relative text-left border p-4 transition-colors",
                  active
                    ? "bg-forest text-cream border-forest"
                    : "bg-cream-warm border-ink/10 hover:border-gold text-ink",
                ].join(" ")}
              >
                {s.featured ? (
                  <Sparkles
                    size={12}
                    className={["absolute top-3 right-3", active ? "text-gold" : "text-gold-deep"].join(" ")}
                  />
                ) : null}
                <div className="font-display text-base leading-tight pr-5">{s.name}</div>
                <div className="mt-1.5 flex items-baseline text-xs">
                  <span className={active ? "text-cream/80" : "text-ink-mute"}>
                    {s.durationMin} {t("book.minutes")}
                  </span>
                  <span className={["ml-auto font-medium tabular-nums", active ? "text-gold" : "text-forest"].join(" ")}>
                    {formatPriceRWF(s.price)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="w-time" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
            {t("checkIn.walkIn.time")}{" "}
            <span className="text-ink-mute lowercase tracking-normal text-xs">
              {t("checkIn.walkIn.todayOnly")}
            </span>
          </label>
          <input
            id="w-time"
            type="time"
            required
            step={900}
            min={config.workingHours.open}
            max={config.workingHours.close}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-cream-warm border border-ink/15 px-4 py-3.5 text-base tabular-nums focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="w-staff" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
            {t("checkIn.staffMember")}
          </label>
          <select
            id="w-staff"
            required
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
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
      </div>

      <div>
        <label htmlFor="w-notes" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
          {t("checkIn.walkIn.notes")}{" "}
          <span className="text-ink-mute lowercase tracking-normal text-xs">
            {t("book.step4.optional")}
          </span>
        </label>
        <textarea
          id="w-notes"
          rows={2}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-cream-warm border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors resize-y"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-amber-900">
          {t("checkIn.error")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-forest text-cream px-10 py-4 text-base hover:bg-forest-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "saving" ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-cream/40 border-t-cream animate-spin" />
            {t("checkIn.walkIn.saving")}
          </>
        ) : (
          t("checkIn.walkIn.submit")
        )}
      </button>
    </form>
  );
}
