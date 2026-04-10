import { Severity, SEVERITY_POINTS } from "./types";

export function pointsForSeverity(severity: Severity): number {
  return SEVERITY_POINTS[severity] ?? 0;
}
