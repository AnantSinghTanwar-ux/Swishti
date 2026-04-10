"use client";

import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Trophy } from "lucide-react";

export default function StatsRow() {
  const total = useReportStore((s) => s.totalReported());
  const inProgress = useReportStore((s) => s.inProgress());
  const cleaned = useReportStore((s) => s.cleaned());
  const highSeverity = useReportStore((s) => s.highSeverity());
  const topVolunteer = useReportStore((s) => s.getTopVolunteer());
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white border-[3px] border-black p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-center items-center text-center">
        <p className="text-3xl font-black text-black mb-1">
          <AnimatedCounter value={total} />
        </p>
        <p className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide">{t("totalReports")}</p>
      </div>
      <div className="bg-brutal-cyan border-[3px] border-black p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-center items-center text-center">
        <p className="text-3xl font-black text-black mb-1">
          <AnimatedCounter value={inProgress} />
        </p>
        <p className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide">{t("inProgress")}</p>
      </div>
      <div className="bg-brutal-green border-[3px] border-black p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-center items-center text-center">
        <p className="text-3xl font-black text-black mb-1">
          <AnimatedCounter value={cleaned} />
        </p>
        <p className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide">{t("cleaned")}</p>
      </div>
      <div className="bg-brutal-red border-[3px] border-black p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-center items-center text-center">
        <p className="text-3xl font-black text-black mb-1">
          <AnimatedCounter value={highSeverity} />
        </p>
        <p className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide">{t("highSeverity")}</p>
      </div>
      {/* Top Volunteer Widget */}
      <div className="bg-brutal-yellow border-[3px] border-black p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-center items-center text-center col-span-2 md:col-span-1">
        <Trophy className="w-6 h-6 text-black mb-1" />
        {topVolunteer ? (
          <>
            <p className="text-sm font-black text-black truncate w-full" title={topVolunteer.email}>
              {topVolunteer.email.split("@")[0]}
            </p>
            <p className="text-[10px] font-bold text-black uppercase">
              {topVolunteer.totalPoints} {t("points")} · {topVolunteer.cleanupCount} {t("cleanups")}
            </p>
          </>
        ) : (
          <p className="text-xs font-bold text-black uppercase">—</p>
        )}
        <p className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-wide mt-0.5">{t("topCleaner")}</p>
      </div>
    </div>
  );
}
