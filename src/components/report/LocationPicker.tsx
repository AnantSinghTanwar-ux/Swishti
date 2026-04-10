"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Navigation, MousePointerClick, MapPin, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { withNoSSR } from "@/components/MapWrapper";

const LocationMapPicker = withNoSSR(
  () => import("@/components/report/LocationMapInner"),
  "Loading map..."
);

interface LocationPickerProps {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
}

export default function LocationPicker({ location, setLocation }: LocationPickerProps) {
  const [mode, setMode] = useState<"choose" | "gps" | "map">("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGPS = useCallback(() => {
    setLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
        setMode("gps");
      },
      (err) => {
        setError(err.message || "Failed to get location");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setLocation]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Pick Location</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Use your current GPS location or tap on the map to drop a pin.
      </p>

      {mode === "choose" && !location && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard onClick={handleGPS} className="p-8 text-center" glowColor="glow-green">
            {loading ? (
              <Loader2 className="w-10 h-10 mx-auto mb-3 text-brand-light animate-spin" />
            ) : (
              <Navigation className="w-10 h-10 mx-auto mb-3 text-brand-light" />
            )}
            <h3 className="font-semibold mb-1">Use My Location</h3>
            <p className="text-xs text-muted-foreground">Auto-detect via GPS</p>
          </GlassCard>
          <GlassCard onClick={() => setMode("map")} className="p-8 text-center" glowColor="glow-orange">
            <MousePointerClick className="w-10 h-10 mx-auto mb-3 text-amber-400" />
            <h3 className="font-semibold mb-1">Pick on Map</h3>
            <p className="text-xs text-muted-foreground">Click to drop a pin</p>
          </GlassCard>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          {error}
        </motion.p>
      )}

      {(mode === "map" || (mode === "choose" && !location)) && mode === "map" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="h-[350px] rounded-2xl overflow-hidden border border-border/30">
            <LocationMapPicker location={location} setLocation={setLocation} />
          </div>
        </motion.div>
      )}

      {location && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 flex items-center justify-center gap-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand/20 text-sm">
            <MapPin className="w-4 h-4 text-brand-light" />
            <span className="text-brand-light font-medium">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
          <button
            onClick={() => {
              setLocation(null as any);
              setMode("choose");
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            Change
          </button>
        </motion.div>
      )}
    </div>
  );
}
