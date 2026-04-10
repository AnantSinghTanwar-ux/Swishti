import { create } from 'zustand';
import { Report, ActivityEntry, Severity, Status } from './types';
import { generateId } from './utils';

// 5 preloaded realistic Chennai dummy reports
const DUMMY_REPORTS: Report[] = [
  {
    id: 'rpt-001',
    lat: 13.0500,
    lng: 80.2824,
    imageUrl: '/demo/marina-beach.jpg',
    severity: 'high',
    status: 'reported',
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
  },
  {
    id: 'rpt-002',
    lat: 13.0418,
    lng: 80.2341,
    imageUrl: '/demo/t-nagar.jpg',
    severity: 'medium',
    status: 'reported',
    timestamp: Date.now() - 3600000 * 5, // 5 hours ago
  },
  {
    id: 'rpt-003',
    lat: 13.0012,
    lng: 80.2565,
    imageUrl: '/demo/adyar.jpg',
    severity: 'low',
    status: 'in-progress',
    timestamp: Date.now() - 3600000 * 8, // 8 hours ago
    claimedBy: 'Volunteer A',
  },
  {
    id: 'rpt-004',
    lat: 13.0339,
    lng: 80.2707,
    imageUrl: '/demo/mylapore.jpg',
    severity: 'high',
    status: 'reported',
    timestamp: Date.now() - 3600000 * 1, // 1 hour ago
  },
  {
    id: 'rpt-005',
    lat: 13.0850,
    lng: 80.2101,
    imageUrl: '/demo/anna-nagar.jpg',
    severity: 'medium',
    status: 'cleaned',
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    claimedBy: 'Volunteer B',
    cleanedAt: Date.now() - 3600000 * 12,
  },
];

const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: generateId(),
    action: 'Report submitted — High severity at Marina Beach',
    reportId: 'rpt-001',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: generateId(),
    action: 'Report submitted — Medium severity at T. Nagar',
    reportId: 'rpt-002',
    timestamp: Date.now() - 3600000 * 5,
  },
  {
    id: generateId(),
    action: 'Report claimed for cleanup at Adyar',
    reportId: 'rpt-003',
    timestamp: Date.now() - 3600000 * 7,
  },
  {
    id: generateId(),
    action: 'Report submitted — High severity at Mylapore',
    reportId: 'rpt-004',
    timestamp: Date.now() - 3600000 * 1,
  },
  {
    id: generateId(),
    action: 'Report marked as cleaned at Anna Nagar',
    reportId: 'rpt-005',
    timestamp: Date.now() - 3600000 * 12,
  },
];

interface ReportStore {
  reports: Report[];
  activity: ActivityEntry[];

  // Actions
  addReport: (report: Omit<Report, 'id' | 'status' | 'timestamp'>) => void;
  claimReport: (id: string, volunteer?: string) => void;
  markCleaned: (id: string) => void;

  // Computed
  totalReported: () => number;
  inProgress: () => number;
  cleaned: () => number;
  highSeverity: () => number;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: DUMMY_REPORTS,
  activity: INITIAL_ACTIVITY,

  addReport: (partial) => {
    const report: Report = {
      ...partial,
      id: `rpt-${generateId()}`,
      status: 'reported',
      timestamp: Date.now(),
    };
    const entry: ActivityEntry = {
      id: generateId(),
      action: `New report submitted — ${report.severity.charAt(0).toUpperCase() + report.severity.slice(1)} severity`,
      reportId: report.id,
      timestamp: Date.now(),
    };
    set((state) => ({
      reports: [report, ...state.reports],
      activity: [entry, ...state.activity],
    }));
  },

  claimReport: (id, volunteer = 'You') => {
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, status: 'in-progress' as Status, claimedBy: volunteer } : r
      ),
      activity: [
        {
          id: generateId(),
          action: `Report #${id.slice(-3)} claimed for cleanup by ${volunteer}`,
          reportId: id,
          timestamp: Date.now(),
        },
        ...state.activity,
      ],
    }));
  },

  markCleaned: (id) => {
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, status: 'cleaned' as Status, cleanedAt: Date.now() } : r
      ),
      activity: [
        {
          id: generateId(),
          action: `Report #${id.slice(-3)} marked as cleaned ✅`,
          reportId: id,
          timestamp: Date.now(),
        },
        ...state.activity,
      ],
    }));
  },

  totalReported: () => get().reports.length,
  inProgress: () => get().reports.filter((r) => r.status === 'in-progress').length,
  cleaned: () => get().reports.filter((r) => r.status === 'cleaned').length,
  highSeverity: () => get().reports.filter((r) => r.severity === 'high' && r.status !== 'cleaned').length,
}));
