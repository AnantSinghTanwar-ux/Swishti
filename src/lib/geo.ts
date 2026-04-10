import type { Report, Severity } from "@/lib/types";

export type LatLng = { lat: number; lng: number };

export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return R * c;
}

export function duplicateThresholdMeters(severity?: Severity | null): number {
  if (!severity) return 50;
  if (severity === "low") return 30;
  if (severity === "medium") return 50;
  return 80;
}

export type NearbyReportMatch = {
  report: Report;
  distanceMeters: number;
};

export function findNearbyReports(params: {
  reports: Report[];
  location: LatLng;
  thresholdMeters?: number;
  includeCleaned?: boolean;
}): NearbyReportMatch[] {
  const { reports, location, thresholdMeters = 50, includeCleaned = false } = params;

  const matches: NearbyReportMatch[] = [];
  for (const report of reports) {
    if (!includeCleaned && report.status === "cleaned") continue;

    const distanceMeters = haversineDistanceMeters(location, { lat: report.lat, lng: report.lng });
    if (distanceMeters < thresholdMeters) {
      matches.push({ report, distanceMeters });
    }
  }

  matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return matches;
}
