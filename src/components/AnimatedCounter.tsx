"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, className = "", duration = 1.2 }: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      if (displayRef.current) {
        displayRef.current.textContent = latest.toLocaleString();
      }
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <motion.span
      ref={displayRef}
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3 }}
      key={value}
    >
      0
    </motion.span>
  );
}
