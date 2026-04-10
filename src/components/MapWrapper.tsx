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
      <div className="w-full h-full min-h-[300px] rounded-2xl bg-muted/30 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          <span className="text-sm">{loadingMessage}</span>
        </div>
      </div>
    ),
  });
}
