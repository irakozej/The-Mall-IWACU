"use client";

/**
 * Revenue view on the /staff dashboard.
 *
 * Only status='completed' sessions count (walk-ins are completed on entry;
 * online bookings once checked in on /staff/check-in), bucketed by when the
 * session was checked in. Cards for today / this ISO week / this calendar
 * month, plus this month's breakdowns by source, service (top 5) and staff.
 */

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { fetchRevenueSummary, type RevenueSummary } from "@/lib/staff";
import { formatPriceRWF, subscribeBookings } from "@/lib/booking";
import { useT } from "@/lib/i18n";

type Summaries = { today: RevenueSummary; week: RevenueSummary; month: RevenueSummary };

export default function RevenueTab() {
  const t = useT();
  const [data, setData] = useState<Summaries | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [today, week, month] = await Promise.all([
        fetchRevenueSummary("today"),
        fetchRevenueSummary("week"),
        fetchRevenueSummary("month"),
      ]);
      setData({ today, week, month });
    } catch {
      setData(null);
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const unsub = subscribeBookings(() => load());
    return unsub;
  }, [load]);

  if (error) {
    return (
      <div className="flex items-center gap-3 border border-amber-600/40 bg-amber-50 px-5 py-4">
        <AlertCircle size={20} className="text-amber-600 shrink-0" />
        <p className="text-sm text-ink-soft">{t("staff.fetchError")}</p>
        <button
          type="button"
          onClick={load}
          className="ml-auto inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-xs text-ink hover:border-gold transition-colors"
        >
          <RefreshCw size={12} /> {t("staff.retry")}
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-16 text-center text-sm text-ink-mute" role="status">
        {t("staff.loading")}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {/* Period totals */}
      <div className="grid sm:grid-cols-3 gap-3">
        <PeriodCard label={t("revenue.today")} summary={data.today} sessionsLabel={t("revenue.sessions")} />
        <PeriodCard label={t("revenue.thisWeek")} summary={data.week} sessionsLabel={t("revenue.sessions")} />
        <PeriodCard label={t("revenue.thisMonth")} summary={data.month} sessionsLabel={t("revenue.sessions")} />
      </div>

      <p className="text-xs text-ink-mute max-w-prose">{t("revenue.note")}</p>

      {/* This month's breakdowns */}
      <section>
        <h3 className="font-display text-2xl text-forest">{t("revenue.bySource")}</h3>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 sm:max-w-lg">
          {data.month.bySource.map((s) => (
            <div key={s.source} className="bg-cream-warm border border-ink/10 px-4 py-3">
              <div className="text-[10px] tracking-[0.25em] uppercase text-ink-mute">
                {s.source === "online" ? t("revenue.online") : t("revenue.walkIn")}
              </div>
              <div className="mt-1 font-display text-xl text-forest tabular-nums">
                {formatPriceRWF(s.total)}
              </div>
              <div className="text-xs text-ink-soft tabular-nums">
                {s.count} {t("revenue.sessions")}
              </div>
            </div>
          ))}
        </div>
      </section>

      <BreakdownTable
        heading={t("revenue.byService")}
        nameHeader={t("staff.serviceCol")}
        rows={data.month.byService}
        sessionsLabel={t("revenue.sessions")}
        revenueLabel={t("staff.summary.revenue")}
        empty={t("revenue.empty")}
      />
      <BreakdownTable
        heading={t("revenue.byStaff")}
        nameHeader={t("checkIn.staffMember")}
        rows={data.month.byStaff}
        sessionsLabel={t("revenue.sessions")}
        revenueLabel={t("staff.summary.revenue")}
        empty={t("revenue.empty")}
      />
    </div>
  );
}

function PeriodCard({
  label,
  summary,
  sessionsLabel,
}: {
  label: string;
  summary: RevenueSummary;
  sessionsLabel: string;
}) {
  return (
    <div className="relative bg-cream-warm border border-ink/10 px-5 py-4 overflow-hidden">
      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold" aria-hidden />
      <div className="text-[10px] tracking-[0.25em] uppercase text-ink-mute">{label}</div>
      <div className="mt-1 font-display text-2xl text-forest tabular-nums">
        {formatPriceRWF(summary.total)}
      </div>
      <div className="text-xs text-ink-soft tabular-nums">
        {summary.count} {sessionsLabel}
      </div>
    </div>
  );
}

function BreakdownTable({
  heading,
  nameHeader,
  rows,
  sessionsLabel,
  revenueLabel,
  empty,
}: {
  heading: string;
  nameHeader: string;
  rows: { name: string; count: number; total: number }[];
  sessionsLabel: string;
  revenueLabel: string;
  empty: string;
}) {
  return (
    <section>
      <h3 className="font-display text-2xl text-forest">{heading}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-mute">{empty}</p>
      ) : (
        <div className="mt-3 border border-ink/10 bg-cream-warm/50 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-[10px] tracking-[0.25em] uppercase text-ink-mute">
                <th className="text-left font-normal px-4 sm:px-5 py-2.5">{nameHeader}</th>
                <th className="text-right font-normal px-4 py-2.5">{sessionsLabel}</th>
                <th className="text-right font-normal px-4 sm:px-5 py-2.5">{revenueLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="px-4 sm:px-5 py-2.5 text-ink">{r.name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink-soft">{r.count}</td>
                  <td className="px-4 sm:px-5 py-2.5 text-right tabular-nums text-forest font-medium">
                    {formatPriceRWF(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
