export type Severity = 'low' | 'medium' | 'high';
export type Status = 'reported' | 'in_progress' | 'pending_proof' | 'cleaned';

export interface Report {
  id: string;
  lat: number;
  lng: number;
  beforeImage: string;     // required: "before" image (reporting stage)
  afterImage?: string;     // optional: "after" image (proof of cleanup)
  severity: Severity;
  status: Status;
  createdAt: number;       // epoch ms
  createdBy: string;       // email of the reporter
  claimedBy?: string;      // email of the volunteer who claimed the report
  cleanedAt?: number;
}

export interface ActivityEntry {
  id: string;
  action?: string;         // optional legacy/human-readable message
  reportId: string;
  timestamp: number;       // epoch ms
  userEmail?: string;      // who performed the action
  type?: 'report' | 'claim' | 'proof' | 'clean';
  // Optional details for richer UI/translation
  severity?: Severity;
  points?: number;
}

export interface UserProfile {
  email: string;
  totalPoints: number;
  cleanupCount: number;
  badge?: string;          // e.g. "Top Cleaner", "Rising Star"
}

// Scoring rules
export const SEVERITY_POINTS: Record<Severity, number> = {
  low: 10,
  medium: 25,
  high: 50,
};
