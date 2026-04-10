"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { timeAgo } from "@/lib/utils";

export default function ActivityFeed() {
  const activity = useReportStore((s) => s.activity);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activity.length]);

  return (
    <div className="glass rounded-2xl border border-border/20 flex flex-col h-[450px] sm:h-[550px]">
      <div className="px-5 py-3 border-b border-border/20 flex items-center gap-2 shrink-0">
        <Activity className="w-4 h-4 text-brand-light" />
        <h2 className="text-sm font-semibold">Activity Feed</h2>
        <span className="ml-auto text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-brand/10">
          {activity.length} events
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence initial={false}>
          {activity.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 rounded-xl bg-muted/20 border border-border/10 hover:bg-muted/30 transition-colors"
            >
              <p className="text-sm leading-relaxed">{entry.action}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeAgo(entry.timestamp)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
