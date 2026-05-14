"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Check, MessageCircle, Sparkles } from "lucide-react";
import {
  bookings as confirmedBookings,
  config,
  formatPriceRWF,
  generateDateOptions,
  generateSlots,
  toDateString,
  type Service,
  type Slot,
} from "@/lib/booking";
import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";

const PENDING_KEY = "themalliwacu:pending-bookings:v1";

type Pending = {
  date: string;
  startTime: string;
  endTime: string;
  serviceId: string;
  serviceName: string;
  durationMin: number;
  createdAt: number;
};

function loadPending(): Pending[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Pending[];
    // Drop anything older than 24h
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return data.filter((p) => p.createdAt > cutoff);
  } catch {
    return [];
  }
}

function savePending(p: Pending[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(p));
}

export default function BookingForm() {
  const t = useT();
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slotStart, setSlotStart] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [pending, setPending] = useState<Pending[]>([]);
  // `now` lives in state so the past/lead-time checks happen after hydration —
  // avoids a server/client mismatch when generating slots.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    setPending(loadPending());
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const dateOptions = useMemo(
    () => (now ? generateDateOptions(config.maxDaysAhead, now) : []),
    [now],
  );

  // Treat any pending booking for the same service-or-date as a soft block.
  const effectiveBookings = useMemo(() => {
    const pendingAsBookings = pending.map((p) => ({
      date: p.date,
      startTime: p.startTime,
      durationMin: p.durationMin,
    }));
    return [...confirmedBookings, ...pendingAsBookings];
  }, [pending]);

  const slots: Slot[] = useMemo(() => {
    if (!service || !date || !now) return [];
    return generateSlots(date, service.durationMin, effectiveBookings, config, now);
  }, [service, date, effectiveBookings, now]);

  const selectedSlot = slots.find((s) => s.start === slotStart) ?? null;
  const canSubmit =
    service && date && selectedSlot?.available && name.trim().length >= 2;

  // Reset deeper picks when an earlier pick changes
  function pickService(s: Service) {
    setService(s);
    setSlotStart(null);
  }
  function pickDate(d: string) {
    setDate(d);
    setSlotStart(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !service || !date || !selectedSlot) return;
    setStatus("submitting");

    const text = [
      t("book.messagePrefix"),
      "",
      t("book.messageBody"),
      `• ${t("step1Service") || "Service"}: ${service.name}`,
      `• ${t("step2Date") || "Date"}: ${date}`,
      `• ${t("step3Time") || "Time"}: ${selectedSlot.start} — ${selectedSlot.end}`,
      `• ${service.durationMin} ${t("book.minutes")}`,
      `• ${formatPriceRWF(service.price)}`,
      `• ${t("book.step4.name")}: ${name.trim()}`,
      phone.trim() ? `• ${t("book.step4.phone")}: ${phone.trim()}` : "",
      notes.trim() ? `• ${t("book.step4.notes")}: ${notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${site.whatsappDigits}?text=${encodeURIComponent(text)}`;

    // Hold the slot locally so this same browser does not show it as free.
    const next = [
      ...pending,
      {
        date,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        serviceId: service.id,
        serviceName: service.name,
        durationMin: service.durationMin,
        createdAt: Date.now(),
      },
    ];
    savePending(next);
    setPending(next);

    window.setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("sent");
    }, 300);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-12">
      {/* Step 1 — Service */}
      <Step
        number={1}
        title={t("book.step1.title")}
        subtitle={t("book.step1.subtitle")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {config.services.map((s) => {
            const active = service?.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => pickService(s)}
                className={[
                  "relative text-left border p-4 transition-colors",
                  active
                    ? "bg-forest text-cream border-forest"
                    : "bg-cream-warm border-ink/10 hover:border-gold text-ink",
                ].join(" ")}
              >
                {s.featured ? (
                  <span
                    className={[
                      "absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] tracking-[0.25em] uppercase",
                      active ? "text-gold" : "text-gold-deep",
                    ].join(" ")}
                  >
                    <Sparkles size={10} /> {t("common.signature")}
                  </span>
                ) : null}
                <div className="font-display text-lg leading-tight pr-16">
                  {s.name}
                </div>
                <div className="mt-2 flex items-baseline gap-3 text-xs">
                  <span className={active ? "text-cream/80" : "text-ink-mute"}>
                    {s.durationMin} {t("book.minutes")}
                  </span>
                  <span
                    className={[
                      "ml-auto font-medium tabular-nums",
                      active ? "text-gold" : "text-forest",
                    ].join(" ")}
                  >
                    {formatPriceRWF(s.price)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Step>

      {/* Step 2 — Date */}
      <Step
        number={2}
        title={t("book.step2.title")}
        subtitle={t("book.step2.subtitle", { days: config.maxDaysAhead })}
        disabled={!service}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 tabs-row">
          {dateOptions.map((d) => {
            const iso = toDateString(d);
            const active = date === iso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => pickDate(iso)}
                className={[
                  "shrink-0 min-w-[80px] text-center px-4 py-3 border transition-colors",
                  active
                    ? "bg-forest text-cream border-forest"
                    : "bg-cream-warm border-ink/10 hover:border-gold text-ink",
                ].join(" ")}
              >
                <div className="text-[10px] tracking-[0.2em] uppercase opacity-75">
                  {d.toLocaleDateString("en-GB", { weekday: "short" })}
                </div>
                <div className="font-display text-xl leading-none mt-1">
                  {d.getDate()}
                </div>
                <div className="text-[10px] uppercase mt-1 opacity-75">
                  {d.toLocaleDateString("en-GB", { month: "short" })}
                </div>
              </button>
            );
          })}
        </div>
      </Step>

      {/* Step 3 — Slot */}
      <Step
        number={3}
        title={t("book.step3.title")}
        subtitle={
          service && date
            ? t("book.step3.subtitleReady", {
                duration: service.durationMin,
                open: config.workingHours.open,
                close: config.workingHours.close,
              })
            : t("book.step3.subtitleEmpty")
        }
        disabled={!service || !date}
      >
        {!service || !date ? null : slots.length === 0 ? (
          <p className="text-sm text-ink-soft">
            {t("book.step3.noTimes")}
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {slots.map((s) => {
              const active = slotStart === s.start;
              const cls = !s.available
                ? "bg-cream-warm/60 text-ink-mute border-ink/8 line-through cursor-not-allowed"
                : active
                  ? "bg-forest text-cream border-forest"
                  : "bg-cream-warm border-ink/10 hover:border-gold text-ink";
              return (
                <button
                  key={s.start}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setSlotStart(s.start)}
                  title={
                    s.reason === "booked"
                      ? t("book.slotReasons.booked")
                      : s.reason === "past"
                        ? t("book.slotReasons.past")
                        : s.reason === "lead-time"
                          ? t("book.slotReasons.leadTime")
                          : undefined
                  }
                  className={[
                    "border py-2.5 text-sm font-medium tabular-nums transition-colors",
                    cls,
                  ].join(" ")}
                >
                  {s.start}
                </button>
              );
            })}
          </div>
        )}

        {selectedSlot?.available ? (
          <div className="mt-5 bg-forest-deep text-cream px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold/85">
              {t("book.step3.yourSession")}
            </span>
            <span className="font-display text-xl">
              {selectedSlot.start} — {selectedSlot.end}
            </span>
            <span className="text-cream/75 text-sm">
              {service?.name} · {service?.durationMin} {t("book.minutes")}
            </span>
          </div>
        ) : null}
      </Step>

      {/* Step 4 — Your details */}
      <Step
        number={4}
        title={t("book.step4.title")}
        subtitle={t("book.step4.subtitle")}
        disabled={!selectedSlot?.available}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="b-name" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
              {t("book.step4.name")}
            </label>
            <input
              id="b-name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-cream-warm border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors"
              placeholder={t("book.step4.namePlaceholder")}
            />
          </div>
          <div>
            <label htmlFor="b-phone" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
              {t("book.step4.phone")} <span className="text-ink-mute lowercase tracking-normal text-xs">{t("book.step4.optional")}</span>
            </label>
            <input
              id="b-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-cream-warm border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors"
              placeholder={t("book.step4.phonePlaceholder")}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="b-notes" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
              {t("book.step4.notes")} <span className="text-ink-mute lowercase tracking-normal text-xs">{t("book.step4.optional")}</span>
            </label>
            <textarea
              id="b-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-cream-warm border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors resize-y"
              placeholder={t("book.step4.notesPlaceholder")}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || status !== "idle"}
          className={[
            "mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm transition-colors",
            status === "sent"
              ? "bg-emerald-600 text-white"
              : "bg-forest text-cream hover:bg-forest-deep",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {status === "sent" ? (
            <>
              <Check size={16} /> {t("book.step4.opening")}
            </>
          ) : status === "submitting" ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-cream/40 border-t-cream animate-spin" />
              {t("book.step4.preparing")}
            </>
          ) : (
            <>
              <MessageCircle size={16} /> {t("book.step4.submit")}
            </>
          )}
        </button>

        <p className="mt-3 text-[11px] text-ink-mute max-w-prose">
          {t("book.step4.hold")}
        </p>
      </Step>
    </form>
  );
}

function Step({
  number,
  title,
  subtitle,
  disabled = false,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <section className={disabled ? "opacity-50 pointer-events-none select-none" : ""} aria-disabled={disabled || undefined}>
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold-deep">
          {t("book.step")} {String(number).padStart(2, "0")}
        </p>
        <h2 className="mt-1 font-display text-2xl sm:text-3xl text-forest leading-tight flex items-center gap-2">
          {number === 1 ? <Sparkles size={18} className="text-gold" /> : null}
          {number === 2 ? <Calendar size={18} className="text-gold" /> : null}
          {number === 3 ? <Clock size={18} className="text-gold" /> : null}
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
