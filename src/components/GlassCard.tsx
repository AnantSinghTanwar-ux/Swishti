"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string; // Kept for prop compatibility, can map to brutal colors
  onClick?: () => void;
  hover?: boolean;
}

export function GlassCard({
  children,
  className = "",
  glowColor,
  onClick,
  hover = true,
}: GlassCardProps) {
  // Map old "glow" concepts to brutalist backgrounds if desired.
  // Often it's passed as a specific string.
  let bgClass = "bg-white";
  if (glowColor === "glow-red") bgClass = "bg-brutal-red hover:bg-[#ef4444]";
  if (glowColor === "glow-green") bgClass = "bg-brutal-green hover:bg-[#22c55e]";
  if (glowColor === "glow-orange") bgClass = "bg-brutal-yellow hover:bg-[#eab308]";
  
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "brutal-card p-5",
        bgClass,
        hover && "brutal-hover cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
