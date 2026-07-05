"use client";

/**
 * /staff/check-in — the massage team's phone tool.
 *
 * Tab A (default): log a walk-in client — inserted as a completed booking so
 * revenue is counted immediately.
 * Tab B: check in today's confirmed online bookings (status → completed).
 *
 * Gated by the same Supabase Auth staff login as /staff. If Supabase isn't
 * configured, staff see a "backend not configured" notice — walk-in data must
 * persist, so there is deliberately no local-JSON fallback here.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { AlertCircle, ArrowLeft, CalendarCheck, UserPlus } from "lucide-react";
import ImigongoPattern from "@/components/ImigongoPattern";
import WalkInForm from "@/components/WalkInForm";
import CheckInList from "@/components/CheckInList";
import { LoginForm, Notice } from "@/components/StaffDashboard";
import { watchStaffSession } from "@/lib/staff";
import { isSupabaseConfigured } from "@/lib/booking";
import { useT } from "@/lib/i18n";

type Tab = "walkIn" | "bookings";

export default function CheckInPage() {
  const t = useT();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("walkIn");

  useEffect(() => watchStaffSession(setSession), []);

  return (
    <>
      <section className="relative bg-forest-deep text-cream overflow-hidden">
        <ImigongoPattern className="absolute -right-20 -top-20 w-[380px] h-[380px] opacity-80" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
            {t("staff.kicker")}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl leading-[0.95]">
            {t("checkIn.heading")}
          </h1>
          <p className="mt-3 max-w-md text-cream/75 text-sm sm:text-base">
            {t("checkIn.intro")}
          </p>
          <Link
            href="/staff"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold-soft transition-colors"
          >
            <ArrowLeft size={14} /> {t("checkIn.backToBookings")}
          </Link>
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <section className="bg-cream py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          {!isSupabaseConfigured ? (
            <Notice>
              <AlertCircle size={20} className="text-amber-600 shrink-0" />
              <p className="text-sm text-ink-soft">{t("checkIn.notConfigured")}</p>
            </Notice>
          ) : session === undefined ? (
            <p className="py-16 text-center text-sm text-ink-mute" role="status">
              {t("staff.loading")}
            </p>
          ) : !session ? (
            <LoginForm />
          ) : (
            <div className="space-y-7">
              {/* Big phone-friendly tabs */}
              <div className="grid grid-cols-2 border border-ink/15">
                <TabButton
                  active={tab === "walkIn"}
                  onClick={() => setTab("walkIn")}
                  icon={<UserPlus size={16} />}
                  label={t("checkIn.tabs.walkIn")}
                />
                <TabButton
                  active={tab === "bookings"}
                  onClick={() => setTab("bookings")}
                  icon={<CalendarCheck size={16} />}
                  label={t("checkIn.tabs.bookings")}
                />
              </div>

              {tab === "walkIn" ? <WalkInForm /> : <CheckInList />}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function TabButton({
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
        "inline-flex items-center justify-center gap-2 px-3 py-4 text-sm font-medium transition-colors",
        active ? "bg-forest text-cream" : "bg-cream-warm text-ink hover:text-gold-deep",
      ].join(" ")}
    >
      {icon} {label}
    </button>
  );
}
