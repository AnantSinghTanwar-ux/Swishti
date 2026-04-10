export type Severity = 'low' | 'medium' | 'high';
export type Status = 'reported' | 'in-progress' | 'cleaned';

export interface Report {
  id: string;
  lat: number;
  lng: number;
  imageUrl: string;
  severity: Severity;
  status: Status;
  timestamp: number;
  claimedBy?: string;
  cleanedAt?: number;
}

export interface ActivityEntry {
  id: string;
  action: string;
  reportId: string;
  timestamp: number;
}
