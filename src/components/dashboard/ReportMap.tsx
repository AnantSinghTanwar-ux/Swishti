"use client";

import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";
import { useReportStore } from "@/lib/store";
import { Report, Severity, Status } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useEffect, useState } from "react";
import type { TranslationKey } from "@/lib/i18n";

const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#A5D6A7",
  medium: "#E6C84F",
  high: "#E57373",
};

const STATUS_KEYS: Record<Status, string> = {
  reported: "reported",
  in_progress: "inProgressStatus",
  pending_proof: "pendingProof",
  cleaned: "cleanedStatus",
};

const STATUS_COLORS: Record<Status, string> = {
  reported: "#E6C84F",
  in_progress: "#3BB3C3",
  pending_proof: "#E6C84F",
  cleaned: "#A5D6A7",
};

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

function CurrentLocationControl() {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 14, { animate: true, duration: 1.5 });
        L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: "bg-transparent",
            html: `<div style="width: 14px; height: 14px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [14, 14],
          })
        }).addTo(map);
        setLoading(false);
      },
      (err) => {
        alert(err.message || "Failed to get location");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <button
      onClick={locateUser}
      disabled={loading}
      style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        backgroundColor: '#E6C84F',
        border: '3px solid #000',
        borderRadius: '0',
        padding: '8px',
        cursor: 'pointer',
        boxShadow: '3px 3px 0px #000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.1s'
      }}
      className="hover:translate-x-0.5 hover:translate-y-0.5"
      title="Use My Location"
    >
      <Navigation style={{ width: '18px', height: '18px', color: '#000' }} />
    </button>
  );
}

function ReportMarker({ report }: { report: Report }) {
  const { user, claimReport, startCleanup, openProofModal } = useReportStore();
  const { t } = useTranslation();

  const handleAction = (action: () => void) => {
    if (!user) {
      alert(t("pleaseLogin"));
      return;
    }
    action();
  };

  const color = report.status === "cleaned"
    ? "#6b7280"
    : report.status === "in_progress" || report.status === "pending_proof"
      ? "#3BB3C3"
      : SEVERITY_COLORS[report.severity];

  const fillOpacity = report.status === "cleaned" ? 0.3 : 0.8;
  const radius = report.severity === "high" ? 12 : report.severity === "medium" ? 10 : 8;
  const statusKey = STATUS_KEYS[report.status] as TranslationKey;
  const statusColor = STATUS_COLORS[report.status];

  const isPriority = report.severity === "high" && report.status === "reported";

  const popupContent = (
    <Popup minWidth={260} maxWidth={300}>
      <div style={{ fontFamily: "inherit", color: "#000" }}>
        {/* Before Image (always shown) */}
        <div
          style={{
            width: "100%",
            height: "120px",
            border: "3px solid #000",
            overflow: "hidden",
            marginBottom: "10px",
            background: "#f0f0f0",
            boxShadow: "3px 3px 0px #000"
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.beforeImage}
            alt="Before"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Before/After Comparison (if cleaned) */}
        {report.status === "cleaned" && report.afterImage && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "9px", fontWeight: 900, marginBottom: "3px", background: "#E6C84F", display: "inline-block", padding: "1px 6px", border: "2px solid #000" }}>
                {t("beforeLabel")}
              </p>
              <div style={{ border: "2px solid #000", height: "70px", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={report.beforeImage} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "9px", fontWeight: 900, marginBottom: "3px", background: "#A5D6A7", display: "inline-block", padding: "1px 6px", border: "2px solid #000" }}>
                {t("afterLabel")}
              </p>
              <div style={{ border: "2px solid #000", height: "70px", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={report.afterImage} alt="After" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "2px 8px", fontSize: "10px", fontWeight: 800,
              background: SEVERITY_COLORS[report.severity], color: "#000",
              border: "2px solid #000", textTransform: "uppercase"
            }}
          >
            {report.severity.toUpperCase()}
          </span>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "2px 8px", fontSize: "10px", fontWeight: 800,
              background: statusColor, color: "#000",
              border: "2px solid #000", textTransform: "uppercase"
            }}
          >
            {t(statusKey)}
          </span>
        </div>

        {/* Timestamp and User */}
        <p style={{ fontSize: "11px", color: "#000", marginBottom: "4px", fontWeight: "bold" }}>
          {timeAgo(report.createdAt)}
        </p>
        <p style={{ fontSize: "11px", color: "#000", marginBottom: "10px", fontWeight: "600" }}>
          {t("by")}: {report.createdBy || "Anonymous"}
        </p>

        {/* Actions */}
        {report.status === "reported" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(() => claimReport(report.id));
            }}
            style={{
              width: "100%", padding: "6px 12px",
              background: "#3BB3C3", color: "#000",
              fontSize: "11px", fontWeight: 900,
              border: "3px solid #000", cursor: "pointer",
              boxShadow: "3px 3px 0px #000", textTransform: "uppercase"
            }}
          >
            {t("claimForCleanup")}
          </button>
        )}

        {(report.status === "in_progress" || report.status === "pending_proof") && (
          <div>
            <p style={{ fontSize: "10px", color: "#000", marginBottom: "8px", padding: "3px", background: "#f0f0f0", border: '2px dashed #000', fontWeight: 'bold', textAlign: 'center' }}>
              {t("claimedBy")}: {report.claimedBy || "Volunteer"}
            </p>
            {user?.email === report.claimedBy ? (
              report.status === "in_progress" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(async () => {
                      const res = await startCleanup(report.id);
                      if (!res.success) alert(res.error || "Failed to start cleanup");
                    });
                  }}
                  style={{
                    width: "100%", padding: "6px 12px",
                    background: "#A5D6A7", color: "#000",
                    fontSize: "11px", fontWeight: 900,
                    border: "3px solid #000", cursor: "pointer",
                    boxShadow: "3px 3px 0px #000", textTransform: "uppercase"
                  }}
                >
                  {t("markCleaned")}
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(() => openProofModal(report.id));
                  }}
                  style={{
                    width: "100%", padding: "6px 12px",
                    background: "#E6C84F", color: "#000",
                    fontSize: "11px", fontWeight: 900,
                    border: "3px solid #000", cursor: "pointer",
                    boxShadow: "3px 3px 0px #000", textTransform: "uppercase"
                  }}
                >
                  {t("uploadProof")}
                </button>
              )
            ) : (
              <p style={{ fontSize: "10px", color: "#000", textAlign: "center", marginTop: "8px", fontWeight: 'bold' }}>
                {t("lockedToClaimer")}
              </p>
            )}
          </div>
        )}

        {report.status === "cleaned" && (
          <div>
            <p style={{ fontSize: "11px", color: "#000", textAlign: "center", fontWeight: 900, background: '#A5D6A7', padding: '6px', border: '3px solid #000', boxShadow: '2px 2px 0px #000' }}>
              {t("cleanedStatus")} {report.cleanedAt ? timeAgo(report.cleanedAt).toUpperCase() : ""}
            </p>
          </div>
        )}
      </div>
    </Popup>
  );

  if (isPriority) {
    const pulsingIcon = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="pulse-marker" style="color: ${color}; width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; background: ${color}; opacity: 0.8; box-shadow: 0 0 15px ${color};"></div>`,
      iconSize: [radius * 2, radius * 2],
      iconAnchor: [radius, radius]
    });

    return (
      <Marker position={[report.lat, report.lng]} icon={pulsingIcon}>
        {popupContent}
      </Marker>
    );
  }

  return (
    <CircleMarker
      center={[report.lat, report.lng]}
      radius={radius}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: fillOpacity,
        weight: (report.status === "in_progress" || report.status === "pending_proof") ? 3 : 1,
        dashArray: (report.status === "in_progress" || report.status === "pending_proof") ? "5,5" : undefined,
      }}
    >
      {popupContent}
    </CircleMarker>
  );
}

export default function ReportMap() {
  const reports = useReportStore((s) => s.reports);

  return (
    <MapContainer
      center={[13.05, 80.25]}
      zoom={12}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizer />
      <CurrentLocationControl />
      {reports.map((report) => (
        <ReportMarker key={`${report.id}-${report.status}`} report={report} />
      ))}
    </MapContainer>
  );
}
