"use client";

import { motion } from "framer-motion";
import { Sparkles, Leaf, AlertTriangle, Flame } from "lucide-react";
import { Severity } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface SeverityPickerProps {
  severity: Severity | null;
  setSeverity: (s: Severity) => void;
  aiSuggestion: Severity | null;
}

const severityOptions: {
  value: Severity;
  labelKey: "severityLow" | "severityMedium" | "severityHigh";
  descKey: "severityLowDesc" | "severityMediumDesc" | "severityHighDesc";
  icon: typeof Leaf;
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
}[] = [
  {
    value: "low",
    labelKey: "severityLow",
    descKey: "severityLowDesc",
    icon: Leaf,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
    glow: "glow-green",
    textColor: "text-emerald-400",
  },
  {
    value: "medium",
    labelKey: "severityMedium",
    descKey: "severityMediumDesc",
    icon: AlertTriangle,
    gradient: "from-orange-500/20 to-amber-600/10",
    border: "border-orange-500/30",
    glow: "glow-orange",
    textColor: "text-orange-400",
  },
  {
    value: "high",
    labelKey: "severityHigh",
    descKey: "severityHighDesc",
    icon: Flame,
    gradient: "from-red-500/20 to-rose-600/10",
    border: "border-red-500/30",
    glow: "glow-red",
    textColor: "text-red-400",
  },
];

export default function SeverityPicker({ severity, setSeverity, aiSuggestion }: SeverityPickerProps) {
  const { t } = useTranslation();

  const severityLabel = (s: Severity) => {
    if (s === "low") return t("severityLow");
    if (s === "medium") return t("severityMedium");
    return t("severityHigh");
  };

  return (
    <div className="bg-white border-[3px] border-black p-5 sm:p-8 shadow-[3px_3px_0px_#000]">
      <h2 className="text-2xl font-black mb-2 uppercase text-black">{t("selectSeverity")}</h2>
      <p className="text-black font-bold text-xs mb-6 bg-brutal-cyan inline-block px-2 py-1 border-[3px] border-black">
        {t("howSerious")}
        {aiSuggestion && (
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 border-[2px] border-black bg-brutal-yellow text-black text-[10px]">
            <Sparkles className="w-3 h-3 text-black" />
            {t("aiSuggests")}: {severityLabel(aiSuggestion)}
          </span>
        )}
      </p>

      <div className="grid grid-cols-1 gap-4">
        {severityOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = severity === opt.value;
          const isAiSuggested = aiSuggestion === opt.value && !severity;

          return (
            <button
              key={opt.value}
              onClick={() => setSeverity(opt.value)}
              className={cn(
                "relative w-full text-left p-4 sm:p-5 border-[3px] transition-all duration-200 cursor-pointer text-black hover:translate-x-0.5 hover:translate-y-0.5",
                isSelected
                  ? `border-black shadow-none translate-x-1 translate-y-1 ${
                      opt.value === "low"
                        ? "bg-brutal-green"
                        : opt.value === "medium"
                          ? "bg-brutal-yellow"
                          : "bg-brutal-red"
                    }`
                  : isAiSuggested
                  ? `border-black shadow-[3px_3px_0px_#000] bg-white opacity-90 border-dashed`
                  : "border-black shadow-[3px_3px_0px_#000] bg-white"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 flex items-center justify-center shrink-0 border-[3px] border-black bg-white shadow-[3px_3px_0px_#000]"
                  )}
                >
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black uppercase text-black">
                      {t(opt.labelKey)}
                    </h3>
                    {isAiSuggested && !isSelected && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border-2 border-black bg-brutal-yellow text-black text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
                        <Sparkles className="w-3 h-3 text-black" />
                        {t("aiSuggested")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-black/80 mt-1">{t(opt.descKey)}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 border-[3px] border-black bg-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]"
                  >
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
