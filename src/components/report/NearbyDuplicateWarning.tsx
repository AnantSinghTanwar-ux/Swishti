"use client";

import { AlertTriangle, MapPin } from "lucide-react";
import type { NearbyReportMatch } from "@/lib/geo";
import { useTranslation } from "@/lib/i18n";

function formatMeters(meters: number): string {
  if (!Number.isFinite(meters)) return "";
  if (meters < 10) return `${Math.round(meters)}m`;
  return `${Math.round(meters / 5) * 5}m`;
}

export default function NearbyDuplicateWarning({ matches }: { matches: NearbyReportMatch[] }) {
  const { t } = useTranslation();
  if (!matches.length) return null;

  const nearest = matches[0];
  const severityLabel =
    nearest.report.severity === "low"
      ? t("severityLow")
      : nearest.report.severity === "medium"
        ? t("severityMedium")
        : t("severityHigh");

  return (
    <div className="border-[3px] border-black bg-brutal-yellow shadow-[3px_3px_0px_#000] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 border-[3px] border-black bg-white shadow-[2px_2px_0px_#000] flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-black" />
        </div>
        <div className="flex-1">
          <div className="text-sm sm:text-base font-black uppercase text-black">
            {t("nearbyDuplicateTitle")}
          </div>
          <div className="mt-1 text-xs sm:text-sm font-bold text-black/90">
            {t("nearbyDuplicateBody")}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border-[3px] border-black bg-white shadow-[2px_2px_0px_#000] text-[11px] font-black uppercase text-black">
              {t("nearbyDuplicateCount").replace("{count}", String(matches.length))}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border-[3px] border-black bg-white shadow-[2px_2px_0px_#000] text-[11px] font-black uppercase text-black">
              <MapPin className="w-3.5 h-3.5" />
              {t("nearbyDuplicateNearest")
                .replace("{severity}", severityLabel)
                .replace("{distance}", formatMeters(nearest.distanceMeters))}
            </span>
          </div>

          <div className="mt-2 text-[11px] font-bold text-black/80">
            {t("nearbyDuplicateNonBlocking")}
          </div>
        </div>
      </div>
    </div>
  );
}
