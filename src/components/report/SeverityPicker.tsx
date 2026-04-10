"use client";

import { motion } from "framer-motion";
import { Sparkles, Leaf, AlertTriangle, Flame } from "lucide-react";
import { Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SeverityPickerProps {
  severity: Severity | null;
  setSeverity: (s: Severity) => void;
  aiSuggestion: Severity | null;
}

const severityOptions: {
  value: Severity;
  label: string;
  desc: string;
  icon: typeof Leaf;
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
}[] = [
  {
    value: "low",
    label: "Low",
    desc: "Minor litter — a few items scattered",
    icon: Leaf,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
    glow: "glow-green",
    textColor: "text-emerald-400",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Noticeable waste pile — needs attention",
    icon: AlertTriangle,
    gradient: "from-orange-500/20 to-amber-600/10",
    border: "border-orange-500/30",
    glow: "glow-orange",
    textColor: "text-orange-400",
  },
  {
    value: "high",
    label: "High",
    desc: "Major dumping site — urgent cleanup",
    icon: Flame,
    gradient: "from-red-500/20 to-rose-600/10",
    border: "border-red-500/30",
    glow: "glow-red",
    textColor: "text-red-400",
  },
];

export default function SeverityPicker({ severity, setSeverity, aiSuggestion }: SeverityPickerProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Select Severity</h2>
      <p className="text-muted-foreground text-sm mb-6">
        How serious is this garbage hotspot?
        {aiSuggestion && (
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs">
            <Sparkles className="w-3 h-3" />
            AI suggests: {aiSuggestion}
          </span>
        )}
      </p>

      <div className="grid grid-cols-1 gap-4">
        {severityOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = severity === opt.value;
          const isAiSuggested = aiSuggestion === opt.value && !severity;

          return (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSeverity(opt.value)}
              className={cn(
                "relative w-full text-left p-6 rounded-2xl glass border transition-all duration-300 cursor-pointer",
                isSelected
                  ? `${opt.border} bg-gradient-to-r ${opt.gradient} shadow-lg`
                  : isAiSuggested
                  ? `${opt.border} bg-gradient-to-r ${opt.gradient} opacity-80`
                  : "border-border/30 hover:border-border/50",
                opt.glow
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? `bg-gradient-to-br ${opt.gradient}` : "bg-muted/30"
                  )}
                >
                  <Icon className={cn("w-7 h-7", isSelected ? opt.textColor : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("text-lg font-semibold", isSelected && opt.textColor)}>
                      {opt.label}
                    </h3>
                    {isAiSuggested && !isSelected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-[10px] font-medium animate-glow-pulse">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Suggested
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", opt.textColor)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
