"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Dynamic import wrapper for any Leaflet-based component
// Prevents SSR issues since Leaflet requires `window`
export function withNoSSR<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  loadingMessage = "Loading map..."
) {
  return dynamic(importFn, {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[300px] bg-white border-[3px] border-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-black">
          <div className="w-8 h-8 border-[3px] border-black border-t-brutal-cyan animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest">{loadingMessage}</span>
        </div>
      </div>
    ),
  });
}
