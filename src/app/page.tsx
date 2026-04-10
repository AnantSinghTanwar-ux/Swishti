"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, BarChart3, Sparkles, ArrowRight, Shield, Zap, Users } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useReportStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function HomePage() {
  const store = useReportStore();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden hero-bg">
      {/* Brutal background already set globally */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border-[3px] border-black bg-white shadow-[3px_3px_0px_#000] text-sm font-bold uppercase text-black">
            <Sparkles className="w-4 h-4 text-black" />
            {t("badge")}
          </div>
        </motion.div>

        {/* Hero Heading */}
        <motion.div
          variants={itemVariants}
          className="text-center font-bold tracking-tight leading-[1.2] mb-6"
        >
          <div className="text-4xl sm:text-5xl md:text-6xl uppercase">{t("heroLine1")}</div>
          <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-4xl sm:text-5xl md:text-6xl uppercase">
            <span className="bg-brutal-cyan border-[3px] border-black px-4 py-1.5 shadow-[3px_3px_0px_#000] inline-block">{t("heroClean")}</span>
            <span className="bg-brutal-yellow border-[3px] border-black px-4 py-1.5 shadow-[3px_3px_0px_#000] inline-block mt-3 sm:mt-0">{t("heroTogether")}</span>
          </div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-center text-base sm:text-lg font-bold max-w-2xl mx-auto mb-10 leading-relaxed px-4 py-3 border-[3px] border-black bg-white shadow-[3px_3px_0px_#000]"
        >
          {t("heroDesc")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16"
        >
          <Link href="/report">
            <motion.button
              className="group flex justify-center items-center gap-2 w-full sm:w-auto px-6 py-3 bg-brutal-cyan text-black brutal-button text-base border-[3px]"
            >
              <MapPin className="w-5 h-5" />
              {t("reportSpotBtn")}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="/dashboard">
            <motion.button
              className="group flex justify-center items-center gap-2 w-full sm:w-auto px-6 py-3 bg-white text-black brutal-button text-base border-[3px]"
            >
              <BarChart3 className="w-5 h-5 text-black" />
              {t("viewReports")}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Live Stats */}
        <motion.div variants={itemVariants}>
          <p className="text-center text-lg font-bold uppercase tracking-widest text-black mb-6 underline decoration-[3px] underline-offset-4">
            {t("liveStats")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center bg-white border-[3px] border-black p-4 flex flex-col justify-center items-center shadow-[3px_3px_0px_#000]">
              <p className="text-4xl font-black text-black mb-1">
                <AnimatedCounter value={store.totalReported()} />
              </p>
              <p className="text-xs font-bold text-black uppercase tracking-wide">{t("totalReports")}</p>
            </div>
            <div className="text-center bg-brutal-yellow border-[3px] border-black p-4 flex flex-col justify-center items-center shadow-[3px_3px_0px_#000]">
              <p className="text-4xl font-black text-black mb-1">
                <AnimatedCounter value={store.inProgress()} />
              </p>
              <p className="text-xs font-bold text-black uppercase tracking-wide">{t("inProgress")}</p>
            </div>
            <div className="text-center bg-brutal-green border-[3px] border-black p-4 flex flex-col justify-center items-center shadow-[3px_3px_0px_#000]">
              <p className="text-4xl font-black text-black mb-1">
                <AnimatedCounter value={store.cleaned()} />
              </p>
              <p className="text-xs font-bold text-black uppercase tracking-wide">{t("cleaned")}</p>
            </div>
            <div className="text-center bg-brutal-red border-[3px] border-black p-4 flex flex-col justify-center items-center shadow-[3px_3px_0px_#000]">
              <p className="text-4xl font-black text-black mb-1">
                <AnimatedCounter value={store.highSeverity()} />
              </p>
              <p className="text-xs font-bold text-black uppercase tracking-wide">{t("highSeverity")}</p>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div variants={itemVariants} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-[3px] border-black p-6 flex flex-col text-left shadow-[4px_4px_0px_#000]">
            <div className="w-12 h-12 border-[3px] border-black bg-brutal-cyan text-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-3 uppercase text-black">{t("instantReporting")}</h3>
            <p className="text-sm font-bold text-black/80">
              {t("instantReportingDesc")}
            </p>
          </div>
          <div className="bg-white border-[3px] border-black p-6 flex flex-col text-left shadow-[4px_4px_0px_#000]">
            <div className="w-12 h-12 border-[3px] border-black bg-brutal-green text-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-3 uppercase text-black">{t("volunteerCoordination")}</h3>
            <p className="text-sm font-bold text-black/80">
              {t("volunteerCoordinationDesc")}
            </p>
          </div>
          <div className="bg-white border-[3px] border-black p-6 flex flex-col text-left shadow-[4px_4px_0px_#000]">
            <div className="w-12 h-12 border-[3px] border-black bg-brutal-yellow text-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-3 uppercase text-black">{t("smartDashboard")}</h3>
            <p className="text-sm font-bold text-black/80">
              {t("smartDashboardDesc")}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
