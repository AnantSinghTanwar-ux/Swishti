"use client";

import { motion } from "framer-motion";
import StatsRow from "@/components/dashboard/StatsRow";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { withNoSSR } from "@/components/MapWrapper";

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
  return (
    <div className="min-h-screen gradient-bg-vibrant">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time garbage hotspot monitoring & volunteer coordination
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants}>
          <StatsRow />
        </motion.div>

        {/* Map + Activity Feed */}
        <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl overflow-hidden border border-border/20">
              <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Live Map</h2>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Low
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    Medium
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    High
                  </span>
                </div>
              </div>
              <div className="h-[450px] sm:h-[550px]">
                <ReportMap />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
