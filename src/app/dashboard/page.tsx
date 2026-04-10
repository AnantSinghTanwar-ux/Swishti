"use client";

import { motion } from "framer-motion";
import StatsRow from "@/components/dashboard/StatsRow";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import Leaderboard from "@/components/Leaderboard";
import ReportList from "@/components/dashboard/ReportList";
import { withNoSSR } from "@/components/MapWrapper";
import { useTranslation } from "@/lib/i18n";

const ReportMap = withNoSSR(
  () => import("@/components/dashboard/ReportMap"),
  "Loading dashboard map..."
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-black">
            {t("dashboardTitle")}
          </h1>
          <p className="text-base text-black mt-2 font-bold bg-brutal-yellow inline-block px-3 py-1 border-[3px] border-black shadow-[3px_3px_0px_#000]">
            {t("dashboardSubtitle")}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants}>
          <StatsRow />
        </motion.div>

        {/* Map + Activity + Leaderboard */}
        <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border-[3px] border-black shadow-[3px_3px_0px_#000] flex flex-col">
              <div className="px-4 py-3 border-b-[3px] border-black flex items-center justify-between bg-brutal-cyan">
                <h2 className="text-lg font-black uppercase text-black">{t("liveMap")}</h2>
                <div className="flex items-center gap-3 text-xs font-bold text-black uppercase">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 border-[2px] border-black bg-brutal-green" />
                    {t("low")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 border-[2px] border-black bg-brutal-yellow" />
                    {t("medium")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 border-[2px] border-black bg-brutal-red" />
                    {t("high")}
                  </span>
                </div>
              </div>
              <div className="h-[450px] sm:h-[600px] w-full relative z-0">
                <ReportMap />
              </div>
            </div>

            <ReportList />
          </div>

          {/* Right Column: Activity Feed + Leaderboard */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <ActivityFeed />
            <Leaderboard />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
