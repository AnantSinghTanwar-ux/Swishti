"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
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
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "glass rounded-2xl p-6 transition-shadow duration-300",
        hover && "glow-hover cursor-pointer",
        glowColor,
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
