"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Check, MessageCircle, Sparkles } from "lucide-react";
import {
  bookings as confirmedBookings,
  config,
  formatDateLabel,
  formatPriceRWF,
  generateDateOptions,
  generateSlots,
  toDateString,
  type Service,
  type Slot,
} from "@/lib/booking";
import { site } from "@/lib/site";

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
      "Hello The Mall IWACU 👋",
      "",
      "I'd like to book a massage / treatment:",
      `• Service: ${service.name}`,
      `• Date: ${date}`,
      `• Time: ${selectedSlot.start} — ${selectedSlot.end}`,
      `• Duration: ${service.durationMin} min`,
      `• Price: ${formatPriceRWF(service.price)}`,
      `• Name: ${name.trim()}`,
      phone.trim() ? `• Phone: ${phone.trim()}` : "",
      notes.trim() ? `• Notes: ${notes.trim()}` : "",
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
        title="Choose your treatment"
        subtitle="Each service has its own duration. Pick one to see times."
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
                    <Sparkles size={10} /> Signature
                  </span>
                ) : null}
                <div className="font-display text-lg leading-tight pr-16">
                  {s.name}
                </div>
                <div className="mt-2 flex items-baseline gap-3 text-xs">
                  <span className={active ? "text-cream/80" : "text-ink-mute"}>
                    {s.durationMin} min
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
        title="Pick a date"
        subtitle={`Booking opens up to ${config.maxDaysAhead} days ahead.`}
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
        title="Choose a time"
        subtitle={
          service && date
            ? `${service.durationMin}-minute session · working hours ${config.workingHours.open}–${config.workingHours.close}`
            : "Pick a service and date first."
        }
        disabled={!service || !date}
      >
        {!service || !date ? null : slots.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No times available — try another day.
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
                      ? "Already booked"
                      : s.reason === "past"
                        ? "Past"
                        : s.reason === "lead-time"
                          ? "Too soon — needs at least 1h notice"
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
              Your session
            </span>
            <span className="font-display text-xl">
              {selectedSlot.start} — {selectedSlot.end}
            </span>
            <span className="text-cream/75 text-sm">
              {service?.name} · {service?.durationMin} min
            </span>
          </div>
        ) : null}
      </Step>

      {/* Step 4 — Your details */}
      <Step
        number={4}
        title="Your details"
        subtitle="We confirm bookings on WhatsApp. Add a quick note if you have one."
        disabled={!selectedSlot?.available}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="b-name" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
              Name
            </label>
            <input
              id="b-name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-cream-warm border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors"
              placeholder="Jean-Paul Mugisha"
            />
          </div>
          <div>
            <label htmlFor="b-phone" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
              Phone <span className="text-ink-mute lowercase tracking-normal text-xs">(optional)</span>
            </label>
            <input
              id="b-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-cream-warm border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors"
              placeholder="+250 7XX XXX XXX"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="b-notes" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
              Notes <span className="text-ink-mute lowercase tracking-normal text-xs">(optional)</span>
            </label>
            <textarea
              id="b-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-cream-warm border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors resize-y"
              placeholder="Preferences, pressure, allergies, etc."
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
              <Check size={16} /> Opening WhatsApp…
            </>
          ) : status === "submitting" ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-cream/40 border-t-cream animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              <MessageCircle size={16} /> Request via WhatsApp
            </>
          )}
        </button>

        <p className="mt-3 text-[11px] text-ink-mute max-w-prose">
          Your slot is held tentatively in your browser for 24 hours. Final
          confirmation comes when our team replies on WhatsApp.
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
  return (
    <section className={disabled ? "opacity-50 pointer-events-none select-none" : ""} aria-disabled={disabled || undefined}>
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold-deep">
          Step {String(number).padStart(2, "0")}
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
