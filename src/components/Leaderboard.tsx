"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Medal } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

export default function Leaderboard() {
  const leaderboard = useReportStore((s) => s.leaderboard);
  const { t } = useTranslation();

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-black" />;
    if (index === 1) return <Medal className="w-5 h-5 text-black" />;
    if (index === 2) return <Star className="w-5 h-5 text-black" />;
    return <span className="text-sm font-black text-black w-5 text-center">{index + 1}</span>;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-brutal-yellow";
    if (index === 1) return "bg-white";
    if (index === 2) return "bg-brutal-cyan";
    return "bg-white";
  };

  return (
    <div className="bg-white border-[3px] border-black shadow-[3px_3px_0px_#000] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b-[3px] border-black bg-brutal-green flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-black" />
          <h2 className="text-lg font-black uppercase text-black">{t("topVolunteers")}</h2>
        </div>
        <span className="text-[10px] font-bold text-black border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0px_#000]">
          {leaderboard.length} {t("volunteer").toUpperCase()}S
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_70px_60px] px-4 py-2 border-b-[2px] border-black bg-neutral-100 text-[10px] font-black uppercase text-black">
        <span>{t("rank")}</span>
        <span>{t("volunteer")}</span>
        <span className="text-right">{t("score")}</span>
        <span className="text-right">{t("cleans")}</span>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto max-h-[320px]">
        {leaderboard.length === 0 ? (
          <div className="p-6 text-center text-sm font-bold text-black/60 uppercase">
            {t("noVolunteers")}
          </div>
        ) : (
          leaderboard.map((user, i) => (
            <motion.div
              key={user.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-[40px_1fr_70px_60px] px-4 py-2.5 items-center border-b border-black/10 ${getRankBg(i)} ${
                i === 0 ? "border-b-[2px] border-black" : ""
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center">
                {getRankIcon(i)}
              </div>

              {/* Email + Badge */}
              <div className="min-w-0">
                <p className="text-xs font-bold text-black truncate">
                  {user.email.split("@")[0]}
                </p>
                {user.badge && (
                  <span className="inline-block text-[8px] font-black uppercase bg-brutal-yellow px-1.5 py-0.5 border border-black mt-0.5">
                    {user.badge === "Top Cleaner" ? t("topCleaner") : t("risingStar")}
                  </span>
                )}
              </div>

              {/* Points */}
              <div className="text-right">
                <span className="text-sm font-black text-black">{user.totalPoints}</span>
                <span className="text-[8px] font-bold text-black/60 ml-0.5">{t("points")}</span>
              </div>

              {/* Cleanup Count */}
              <div className="text-right">
                <span className="text-sm font-black text-black">{user.cleanupCount}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
