"use client";

import { useMemo, useState } from "react";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";
import type { Status } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";

const STATUS_KEY: Record<Status, string> = {
  reported: "reported",
  in_progress: "inProgressStatus",
  pending_proof: "pendingProof",
  cleaned: "cleanedStatus",
};

export default function ReportList() {
  const reports = useReportStore((s) => s.reports);
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...reports].sort((a, b) => b.createdAt - a.createdAt);
  }, [reports]);

  const selected = useMemo(() => {
    return selectedId ? sorted.find((r) => r.id === selectedId) : null;
  }, [selectedId, sorted]);

  return (
    <div className="bg-white border-[3px] border-black shadow-[3px_3px_0px_#000] flex flex-col">
      <div className="px-4 py-3 border-b-[3px] border-black bg-neutral-100 shrink-0 flex items-center justify-between">
        <h2 className="text-lg font-black uppercase text-black">{t("reports")}</h2>
        <span className="text-[10px] font-bold text-black border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0px_#000]">
          {sorted.length}
        </span>
      </div>

      {/* List */}
      <div className="max-h-[260px] overflow-y-auto">
        {sorted.slice(0, 25).map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedId(r.id)}
            className={`w-full text-left px-4 py-3 border-b border-black/10 hover:bg-neutral-50 transition-colors ${
              selectedId === r.id ? "bg-brutal-yellow/40" : "bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-10 border-2 border-black overflow-hidden bg-neutral-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.beforeImage} alt="Before" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase text-black truncate">{r.severity}</p>
                  <span className="text-[10px] font-bold text-black/70">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-[10px] font-bold text-black/70 truncate">
                  {t(STATUS_KEY[r.status] as TranslationKey)} · {r.createdBy}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Details panel */}
      {selected && (
        <div className="border-t-[3px] border-black p-4 bg-white">
          <h3 className="text-xs font-black uppercase text-black mb-3">{t("reportDetails")}</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-black uppercase mb-1 bg-brutal-yellow inline-block px-2 py-0.5 border-2 border-black">
                {t("beforeLabel")}
              </p>
              <div className="border-[3px] border-black bg-neutral-100 h-28 overflow-hidden shadow-[2px_2px_0px_#000]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.beforeImage} alt="Before" className="w-full h-full object-cover" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase mb-1 bg-brutal-green inline-block px-2 py-0.5 border-2 border-black">
                {t("afterLabel")}
              </p>
              <div className="border-[3px] border-black bg-neutral-100 h-28 overflow-hidden shadow-[2px_2px_0px_#000]">
                {selected.afterImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.afterImage} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-black/60 uppercase">
                    —
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] font-bold text-black/70">
            <div>{t("by")}: {selected.createdBy}</div>
            <div>{t("claimedBy")}: {selected.claimedBy || "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
