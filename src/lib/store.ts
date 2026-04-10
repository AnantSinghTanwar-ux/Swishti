import { create } from 'zustand';
import { Report, ActivityEntry, UserProfile } from './types';
import type { User } from 'firebase/auth';
import {
  seedIfEmpty,
  subscribeToReports,
  subscribeToActivity,
  subscribeToLeaderboard,
  addReportToFirestore,
  claimReportInFirestore,
  initiatePendingProof,
  submitCleanupProof,
} from './firestore';

// ─── Store Interface ────────────────────────────────────────────────────────

interface ReportStore {
  reports: Report[];
  activity: ActivityEntry[];
  leaderboard: UserProfile[];
  user: User | null;
  initialized: boolean;

  // Proof modal
  proofModalReportId: string | null;
  openProofModal: (reportId: string) => void;
  closeProofModal: () => void;

  // Actions
  setUser: (user: User | null) => void;
  setReports: (reports: Report[]) => void;
  setActivity: (activity: ActivityEntry[]) => void;
  setLeaderboard: (users: UserProfile[]) => void;
  setInitialized: (v: boolean) => void;

  // Firestore-backed actions
  addReport: (report: Omit<Report, 'id' | 'status' | 'createdAt' | 'createdBy' | 'claimedBy' | 'afterImage' | 'cleanedAt'>) => Promise<string>;
  claimReport: (id: string) => Promise<{ success: boolean; error?: string }>;
  startCleanup: (id: string) => Promise<{ success: boolean; error?: string }>;
  submitProof: (reportId: string, afterImageUrl: string) => Promise<{ success: boolean; error?: string }>;

  // Computed
  totalReported: () => number;
  inProgress: () => number;
  cleaned: () => number;
  highSeverity: () => number;
  activeVolunteers: () => number;
  getMostAffectedArea: () => string;
  getTopVolunteer: () => UserProfile | null;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  activity: [],
  leaderboard: [],
  user: null,
  initialized: false,

  proofModalReportId: null,
  openProofModal: (reportId) => set({ proofModalReportId: reportId }),
  closeProofModal: () => set({ proofModalReportId: null }),

  setUser: (user) => set({ user }),
  setReports: (reports) => set({ reports }),
  setActivity: (activity) => set({ activity }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setInitialized: (v) => set({ initialized: v }),

  // ── Firestore-backed actions ────────────────────────────────────────────

  addReport: async (partial) => {
    const currentUser = get().user;
    const email = currentUser?.email || 'Anonymous';
    return addReportToFirestore(partial, email);
  },

  claimReport: async (id) => {
    const currentUser = get().user;
    if (!currentUser?.email) return { success: false, error: "Not logged in" };
    return claimReportInFirestore(id, currentUser.email);
  },

  startCleanup: async (id) => {
    const currentUser = get().user;
    if (!currentUser?.email) return { success: false, error: "Not logged in" };
    const res = await initiatePendingProof(id, currentUser.email);
    if (res.success) {
      get().openProofModal(id);
    }
    return res;
  },

  submitProof: async (reportId, afterImageUrl) => {
    const currentUser = get().user;
    if (!currentUser?.email) return { success: false, error: "Not logged in" };
    return submitCleanupProof(reportId, afterImageUrl, currentUser.email);
  },

  // ── Computed ────────────────────────────────────────────────────────────

  totalReported: () => get().reports.length,
  inProgress: () => get().reports.filter((r) => r.status === 'in_progress' || r.status === 'pending_proof').length,
  cleaned: () => get().reports.filter((r) => r.status === 'cleaned').length,
  highSeverity: () => get().reports.filter((r) => r.severity === 'high' && r.status !== 'cleaned').length,
  activeVolunteers: () => {
    const activeClaimers = new Set(
      get().reports
        .filter((r) => (r.status === 'in_progress' || r.status === 'pending_proof') && r.claimedBy)
        .map((r) => r.claimedBy)
    );
    return activeClaimers.size;
  },
  getMostAffectedArea: () => {
    const high = get().reports.filter((r) => r.severity === 'high' && r.status !== 'cleaned');
    if (high.length > 2) return "Marina Beach Area";
    if (high.length > 0) return "T. Nagar Area";
    return "None currently";
  },
  getTopVolunteer: () => {
    const lb = get().leaderboard;
    return lb.length > 0 && lb[0].totalPoints > 0 ? lb[0] : null;
  },
}));

// ─── Initialize Real-Time Listeners ─────────────────────────────────────────

let listenersInitialized = false;

export function initRealtimeListeners() {
  if (listenersInitialized) return;
  listenersInitialized = true;

  // Seed demo data if Firestore is empty
  seedIfEmpty().then(() => {
    // Subscribe to reports
    subscribeToReports((reports) => {
      useReportStore.setState({ reports });
    });

    // Subscribe to activity
    subscribeToActivity((activity) => {
      useReportStore.setState({ activity });
    });

    // Subscribe to leaderboard
    subscribeToLeaderboard((leaderboard) => {
      useReportStore.setState({ leaderboard });
    });

    useReportStore.setState({ initialized: true });
  });
}
