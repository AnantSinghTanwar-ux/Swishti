"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Navigation, MousePointerClick, MapPin, Loader2 } from "lucide-react";
import { withNoSSR } from "@/components/MapWrapper";
import { useTranslation } from "@/lib/i18n";

const LocationMapPicker = withNoSSR(
  () => import("@/components/report/LocationMapInner"),
  "Loading map..."
);

interface LocationPickerProps {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number } | null) => void;
  onLocationSelected?: (location: { lat: number; lng: number }) => void;
  onLocationCleared?: () => void;
}

export default function LocationPicker({ location, setLocation, onLocationSelected, onLocationCleared }: LocationPickerProps) {
  const [mode, setMode] = useState<"choose" | "gps" | "map">("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

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
        const nextLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(nextLocation);
        onLocationSelected?.(nextLocation);
        setLoading(false);
        setMode("gps");
      },
      (err) => {
        setError(err.message || "Failed to get location");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setLocation, onLocationSelected]);

  return (
    <div className="bg-white border-[3px] border-black p-5 sm:p-8 shadow-[3px_3px_0px_#000]">
      <h2 className="text-2xl font-black mb-2 uppercase text-black">{t("pickLocation")}</h2>
      <p className="text-black font-bold text-xs mb-6 bg-brutal-cyan inline-block px-2 py-1 border-[3px] border-black">
        {t("pickLocationDesc")}
      </p>

      {mode === "choose" && !location && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={handleGPS} className="p-6 text-center bg-brutal-yellow border-[3px] border-black shadow-[3px_3px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center justify-center">
            {loading ? (
              <Loader2 className="w-10 h-10 mx-auto mb-3 text-black animate-spin" />
            ) : (
              <Navigation className="w-10 h-10 mx-auto mb-3 text-black" />
            )}
            <h3 className="font-black text-lg mb-1 uppercase text-black">{t("useMyLocation")}</h3>
            <p className="text-xs font-bold text-black uppercase">{t("autoDetectGPS")}</p>
          </button>
          <button onClick={() => setMode("map")} className="p-6 text-center bg-brutal-cyan border-[3px] border-black shadow-[3px_3px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center justify-center">
            <MousePointerClick className="w-10 h-10 mx-auto mb-3 text-black" />
            <h3 className="font-black text-lg mb-1 uppercase text-black">{t("pickOnMap")}</h3>
            <p className="text-xs font-bold text-black uppercase">{t("clickToDropPin")}</p>
          </button>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-black font-bold text-xs mt-4 p-3 bg-brutal-red border-[3px] border-black shadow-[3px_3px_0px_#000] uppercase"
        >
          ERROR: {error}
        </motion.p>
      )}

      {(mode === "map" || (mode === "choose" && !location)) && mode === "map" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div className="h-[300px] border-[3px] border-black bg-white z-0 relative shadow-[3px_3px_0px_#000]">
            <LocationMapPicker
              location={location}
              setLocation={setLocation}
              onLocationSelected={onLocationSelected}
            />
          </div>
        </motion.div>
      )}

      {location && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-black bg-brutal-green shadow-[3px_3px_0px_#000] text-sm font-black text-black">
            <MapPin className="w-4 h-4 text-black" />
            <span>
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
          <button
            onClick={() => {
              onLocationCleared?.();
              setMode("map");
            }}
            className="text-xs font-black text-black border-[3px] border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors uppercase"
          >
            {t("change")}
          </button>
        </motion.div>
      )}
    </div>
  );
}
