"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useReportStore } from "@/lib/store";
import { Report, Severity, Status } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { useEffect } from "react";

const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#22c55e",
  medium: "#f97316",
  high: "#ef4444",
};

const STATUS_LABELS: Record<Status, { label: string; color: string }> = {
  reported: { label: "Reported", color: "#f59e0b" },
  "in-progress": { label: "In Progress", color: "#3b82f6" },
  cleaned: { label: "Cleaned", color: "#22c55e" },
};

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

function ReportMarker({ report }: { report: Report }) {
  const claimReport = useReportStore((s) => s.claimReport);
  const markCleaned = useReportStore((s) => s.markCleaned);

  const color = report.status === "cleaned" ? "#6b7280" : SEVERITY_COLORS[report.severity];
  const fillOpacity = report.status === "cleaned" ? 0.3 : 0.6;
  const radius = report.severity === "high" ? 12 : report.severity === "medium" ? 10 : 8;
  const statusInfo = STATUS_LABELS[report.status];

  return (
    <CircleMarker
      center={[report.lat, report.lng]}
      radius={radius}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: fillOpacity,
        weight: report.status === "in-progress" ? 3 : 2,
        dashArray: report.status === "in-progress" ? "5,5" : undefined,
      }}
    >
      <Popup minWidth={260} maxWidth={300}>
        <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          {/* Image */}
          <div
            style={{
              width: "100%",
              height: "140px",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "12px",
              background: "#e2e8f0",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={report.imageUrl}
              alt="Hotspot"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                background: `${SEVERITY_COLORS[report.severity]}20`,
                color: SEVERITY_COLORS[report.severity],
                border: `1px solid ${SEVERITY_COLORS[report.severity]}40`,
              }}
            >
              ● {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)} Severity
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                background: `${statusInfo.color}20`,
                color: statusInfo.color,
                border: `1px solid ${statusInfo.color}40`,
              }}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Timestamp */}
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
            📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)} · {timeAgo(report.timestamp)}
          </p>

          {/* Actions */}
          {report.status === "reported" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                claimReport(report.id);
              }}
              style={{
                width: "100%",
                padding: "8px 16px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              🙋 Claim for Cleanup
            </button>
          )}

          {report.status === "in-progress" && (
            <div>
              <p style={{ fontSize: "12px", color: "#2563eb", marginBottom: "8px" }}>
                🔧 Claimed by: {report.claimedBy || "Volunteer"}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markCleaned(report.id);
                }}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                ✅ Mark as Cleaned
              </button>
            </div>
          )}

          {report.status === "cleaned" && (
            <p style={{ fontSize: "12px", color: "#16a34a", textAlign: "center", fontWeight: 600 }}>
              ✅ Cleaned {report.cleanedAt ? timeAgo(report.cleanedAt) : ""}
            </p>
          )}
        </div>
      </Popup>
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
      {reports.map((report) => (
        <ReportMarker key={`${report.id}-${report.status}`} report={report} />
      ))}
    </MapContainer>
  );
}
