"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function ActivityFeed() {
  const activity = useReportStore((s) => s.activity);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activity.length]);

  return (
    <div className="bg-white border-[3px] border-black shadow-[3px_3px_0px_#000] flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b-[3px] border-black flex items-center justify-between shrink-0 bg-brutal-yellow">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-black" />
          <h2 className="text-lg font-black uppercase text-black">{t("activityHub")}</h2>
        </div>
        <span className="text-[10px] font-bold text-black border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0px_#000]">
          {activity.length} {t("events")}
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        <AnimatePresence initial={false}>
          {activity.map((entry) => {
            // Determine a highlight color based on action type
            let tagColor = "bg-brutal-cyan";
            if (entry.type === "clean" || entry.action?.includes("cleaned")) tagColor = "bg-brutal-green";
            if (entry.type === "proof" || entry.action?.includes("proof")) tagColor = "bg-brutal-yellow";
            if (entry.action?.includes("High severity")) tagColor = "bg-brutal-red";

            const actionLabel = (() => {
              if (entry.type === "report") return t("actReportCreated");
              if (entry.type === "claim") return t("actReportClaimed");
              if (entry.type === "proof") return t("actProofUploaded");
              if (entry.type === "clean") return t("actReportCleaned");
              return entry.action || "";
            })();

            const reportTag = entry.reportId ? `#${entry.reportId.slice(-3)}` : "";
            const pointsTag = typeof entry.points === "number" ? `(+${entry.points} ${t("points")})` : "";

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-3 border-[3px] border-black ${tagColor} shadow-[2px_2px_0px_#000]`}
              >
                <p className="text-sm font-bold text-black leading-tight mb-1.5">
                  {actionLabel} {reportTag} {pointsTag}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-black/80">
                    <Clock className="w-3 h-3" />
                    {timeAgo(entry.timestamp)}
                  </div>
                  {entry.userEmail && (
                    <span className="text-[10px] font-bold text-black/60 truncate max-w-[120px]">
                      {entry.userEmail.split("@")[0]}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
