import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  getDocs,
  getDoc,
  increment,
  limit,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";
import { Report, ActivityEntry, UserProfile, Severity, Status } from "./types";
import { generateId } from "./utils";
import { pointsForSeverity } from "./scoring";

type LegacyReportDoc = Partial<Report> & {
  // legacy fields
  timestamp?: number;
  imageUrl?: string;
  // allow unknown status values from legacy docs
  status?: unknown;
};

function normalizeStatus(status: unknown): Status {
  if (status === 'in-progress') return 'in_progress';
  if (status === 'pending-proof') return 'pending_proof';
  if (status === 'reported' || status === 'in_progress' || status === 'pending_proof' || status === 'cleaned') {
    return status as Status;
  }
  return 'reported';
}

function normalizeReport(raw: LegacyReportDoc, fallbackId: string): Report {
  return {
    id: raw?.id ?? fallbackId,
    lat: typeof raw?.lat === "number" ? raw.lat : 0,
    lng: typeof raw?.lng === "number" ? raw.lng : 0,
    severity: raw?.severity ?? "low",
    status: normalizeStatus(raw?.status),
    createdAt: raw?.createdAt ?? raw?.timestamp ?? Date.now(),
    createdBy: raw?.createdBy ?? 'Anonymous',
    claimedBy: raw?.claimedBy,
    beforeImage: raw?.beforeImage ?? raw?.imageUrl ?? '',
    afterImage: raw?.afterImage,
    cleanedAt: raw?.cleanedAt,
  };
}

// ─── Collection References ──────────────────────────────────────────────────

const reportsCol = collection(db, "reports");
const activityCol = collection(db, "activity");
const usersCol = collection(db, "users");

// ─── Seed Data ──────────────────────────────────────────────────────────────

const DUMMY_REPORTS: Omit<Report, 'id'>[] = [
  {
    lat: 13.0500, lng: 80.2824,
    beforeImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
    severity: "high", status: "reported",
    createdAt: Date.now() - 3600000 * 2,
    createdBy: "chennai.citizen@example.com",
  },
  {
    lat: 13.0418, lng: 80.2341,
    beforeImage: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400",
    severity: "medium", status: "reported",
    createdAt: Date.now() - 3600000 * 5,
    createdBy: "volunteer2@example.com",
  },
  {
    // Nearby duplicate (within ~50m of the previous report)
    lat: 13.04205, lng: 80.23425,
    beforeImage: "https://images.unsplash.com/photo-1528323273322-d81458248d40?w=400",
    severity: "low", status: "reported",
    createdAt: Date.now() - 3600000 * 4.7,
    createdBy: "citizen.nearby@example.com",
  },
  {
    lat: 13.0012, lng: 80.2565,
    beforeImage: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400",
    severity: "low", status: "in_progress",
    createdAt: Date.now() - 3600000 * 8,
    createdBy: "john.doe@example.com",
    claimedBy: "volunteer@example.com",
  },
  {
    lat: 13.0339, lng: 80.2707,
    beforeImage: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400",
    severity: "high", status: "reported",
    createdAt: Date.now() - 3600000 * 1,
    createdBy: "jane.smith@example.com",
  },
  {
    lat: 13.0850, lng: 80.2101,
    beforeImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
    severity: "medium", status: "cleaned",
    createdAt: Date.now() - 3600000 * 24,
    createdBy: "local.hero@example.com",
    claimedBy: "volunteer@example.com",
    cleanedAt: Date.now() - 3600000 * 12,
    afterImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
  },
  {
    lat: 13.0872, lng: 80.2092,
    beforeImage: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400",
    severity: "high", status: "pending_proof",
    createdAt: Date.now() - 3600000 * 10,
    createdBy: "school.club@example.com",
    claimedBy: "rising.star@example.com",
  },
];

const SEED_USERS: UserProfile[] = [
  { email: "volunteer@example.com", totalPoints: 120, cleanupCount: 4 },
  { email: "rising.star@example.com", totalPoints: 85, cleanupCount: 3 },
  { email: "cleanup.captain@example.com", totalPoints: 60, cleanupCount: 2 },
  { email: "team.green@example.com", totalPoints: 45, cleanupCount: 2 },
  { email: "volunteer2@example.com", totalPoints: 25, cleanupCount: 1 },
  { email: "local.hero@example.com", totalPoints: 15, cleanupCount: 1 },
  { email: "chennai.citizen@example.com", totalPoints: 0, cleanupCount: 0 },
];

/**
 * Seeds Firestore with demo data if the reports collection is empty.
 * Called once on app startup.
 */
export async function seedIfEmpty(): Promise<void> {
  try {
    const reportsSnap = await getDocs(query(reportsCol, limit(1)));
    const activitySnap = await getDocs(query(activityCol, limit(1)));
    const usersSnap = await getDocs(query(usersCol, limit(1)));

    const shouldSeedReports = reportsSnap.empty;
    const shouldSeedActivity = activitySnap.empty;
    const shouldSeedUsers = usersSnap.empty;

    if (!shouldSeedReports && !shouldSeedActivity && !shouldSeedUsers) return;

    console.log("[Firestore] Seeding demo data...");

    if (shouldSeedReports) {
      // Seed reports
      for (const rpt of DUMMY_REPORTS) {
        const id = `rpt-${generateId()}`;
        await setDoc(doc(reportsCol, id), { ...rpt, id });
      }
    }

    if (shouldSeedActivity) {
      // Seed activity
      const activities: Omit<ActivityEntry, 'id'>[] = [
      { action: "Report submitted — High severity at Marina Beach", reportId: "rpt-001", timestamp: Date.now() - 3600000 * 2, userEmail: "chennai.citizen@example.com", type: "report" },
      { action: "Report submitted — Medium severity at T. Nagar", reportId: "rpt-002", timestamp: Date.now() - 3600000 * 5, userEmail: "volunteer2@example.com", type: "report" },
      { action: "Report claimed for cleanup at Adyar", reportId: "rpt-003", timestamp: Date.now() - 3600000 * 7, userEmail: "volunteer@example.com", type: "claim" },
      { action: "Report submitted — High severity at Mylapore", reportId: "rpt-004", timestamp: Date.now() - 3600000 * 1, userEmail: "jane.smith@example.com", type: "report" },
      { action: "Report marked as cleaned at Anna Nagar", reportId: "rpt-005", timestamp: Date.now() - 3600000 * 12, userEmail: "volunteer@example.com", type: "clean" },
    ];
      for (const act of activities) {
        await addDoc(activityCol, { ...act, id: generateId() });
      }
    }

    if (shouldSeedUsers) {
      // Seed users
      for (const u of SEED_USERS) {
        await setDoc(doc(usersCol, u.email), u);
      }
    }

    console.log("[Firestore] Demo data seeded.");
  } catch (e) {
    console.error("[Firestore] Seed failed:", e);
  }
}

// ─── Real-Time Listeners ────────────────────────────────────────────────────

/**
 * Subscribe to real-time reports.
 * Returns an unsubscribe function.
 */
export function subscribeToReports(callback: (reports: Report[]) => void) {
  const q = query(reportsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const reports: Report[] = snap.docs.map((d) => normalizeReport(d.data() as LegacyReportDoc, d.id));
    callback(reports);
  }, (err) => {
    console.error("[Firestore] Reports listener error:", err);
  });
}

/**
 * Subscribe to real-time activity feed.
 */
export function subscribeToActivity(callback: (activity: ActivityEntry[]) => void) {
  const q = query(activityCol, orderBy("timestamp", "desc"), limit(50));
  return onSnapshot(q, (snap) => {
    const entries: ActivityEntry[] = snap.docs.map((d) => {
      const raw = d.data() as ActivityEntry;
      return {
        ...raw,
        id: raw.id ?? d.id,
      };
    });
    callback(entries);
  }, (err) => {
    console.error("[Firestore] Activity listener error:", err);
  });
}

/**
 * Subscribe to real-time leaderboard (users sorted by totalPoints).
 */
export function subscribeToLeaderboard(callback: (users: UserProfile[]) => void) {
  const q = query(usersCol, orderBy("totalPoints", "desc"), limit(20));
  return onSnapshot(q, (snap) => {
    const users: UserProfile[] = snap.docs.map((d) => d.data() as UserProfile);
    // Assign badges
    users.forEach((u, i) => {
      if (i === 0 && u.totalPoints > 0) u.badge = "Top Cleaner";
      else if (i <= 2 && u.totalPoints > 0) u.badge = "Rising Star";
    });
    callback(users);
  }, (err) => {
    console.error("[Firestore] Leaderboard listener error:", err);
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

/**
 * Ensure a user document exists (called on auth).
 */
export async function ensureUserProfile(email: string): Promise<void> {
  const userRef = doc(usersCol, email);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      email,
      totalPoints: 0,
      cleanupCount: 0,
    });
  }
}

/**
 * Add a new report to Firestore.
 */
export async function addReportToFirestore(
  report: Omit<Report, "id" | "status" | "createdAt" | "createdBy" | "claimedBy" | "afterImage" | "cleanedAt">,
  userEmail: string
): Promise<string> {
  const id = `rpt-${generateId()}`;
  const newReport: Report = {
    ...report,
    id,
    status: "reported",
    createdAt: Date.now(),
    createdBy: userEmail,
  };

  await setDoc(doc(reportsCol, id), newReport);

  // Log activity
  await addDoc(activityCol, {
    id: generateId(),
    action: `New report by ${userEmail}`,
    reportId: id,
    timestamp: Date.now(),
    userEmail,
    type: "report",
    severity: report.severity,
  });

  return id;
}

/**
 * Claim a report for cleanup.
 * Prevents double-claiming.
 */
export async function claimReportInFirestore(
  reportId: string,
  volunteerEmail: string
): Promise<{ success: boolean; error?: string }> {
  const reportRef = doc(reportsCol, reportId);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(reportRef);
      if (!snap.exists()) {
        throw new Error("Report not found");
      }

      const data = snap.data() as LegacyReportDoc;
      const status = normalizeStatus(data.status);
      if (status !== "reported") {
        throw new Error("Report already claimed or cleaned");
      }
      if (data.claimedBy) {
        throw new Error("Report already claimed");
      }

      tx.update(reportRef, {
        status: "in_progress",
        claimedBy: volunteerEmail,
      });

      const activityRef = doc(activityCol);
      tx.set(activityRef, {
        id: activityRef.id,
        reportId,
        timestamp: Date.now(),
        userEmail: volunteerEmail,
        type: "claim",
      } satisfies ActivityEntry);
    });

    await ensureUserProfile(volunteerEmail);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to claim report" };
  }
}

/**
 * Initiate proof upload — sets status to pending-proof.
 * Only the claimer can do this.
 */
export async function initiatePendingProof(
  reportId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  const reportRef = doc(reportsCol, reportId);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(reportRef);
      if (!snap.exists()) throw new Error("Report not found");

      const data = snap.data() as LegacyReportDoc;
      const status = normalizeStatus(data.status);
      const beforeImage = data.beforeImage ?? data.imageUrl;

      if (!beforeImage) throw new Error("Report is missing BEFORE image");
      if (status !== "in_progress") throw new Error("Report must be in progress");
      if (data.claimedBy !== userEmail) throw new Error("Only the claimer can mark cleaned");

      tx.update(reportRef, { status: "pending_proof" });
    });
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to start proof" };
  }
}

/**
 * Submit cleanup proof (after image) and finalize as cleaned.
 * Awards points to the volunteer.
 */
export async function submitCleanupProof(
  reportId: string,
  afterImageUrl: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  const reportRef = doc(reportsCol, reportId);
  const userRef = doc(usersCol, userEmail);

  try {
    await runTransaction(db, async (tx) => {
      const reportSnap = await tx.get(reportRef);
      if (!reportSnap.exists()) throw new Error("Report not found");

      const data = reportSnap.data() as LegacyReportDoc;
      const status = normalizeStatus(data.status);
      const beforeImage = data.beforeImage ?? data.imageUrl;
      if (!beforeImage) throw new Error("Report is missing BEFORE image");

      if (data.claimedBy !== userEmail) throw new Error("Only the claimer can submit proof");
      if (status !== "pending_proof") throw new Error("Report must be pending proof to finalize");
      if (data.afterImage) throw new Error("AFTER image already submitted");

      const severity = data.severity as Severity;
      const points = pointsForSeverity(severity) || 10;

      tx.update(reportRef, {
        status: "cleaned",
        afterImage: afterImageUrl,
        cleanedAt: Date.now(),
      });

      const userSnap = await tx.get(userRef);
      if (userSnap.exists()) {
        tx.update(userRef, {
          totalPoints: increment(points),
          cleanupCount: increment(1),
        });
      } else {
        tx.set(userRef, {
          email: userEmail,
          totalPoints: points,
          cleanupCount: 1,
        } satisfies UserProfile);
      }

      const proofActivityRef = doc(activityCol);
      tx.set(proofActivityRef, {
        id: proofActivityRef.id,
        reportId,
        timestamp: Date.now(),
        userEmail,
        type: "proof",
        severity,
        points,
      } satisfies ActivityEntry);

      const cleanActivityRef = doc(activityCol);
      tx.set(cleanActivityRef, {
        id: cleanActivityRef.id,
        reportId,
        timestamp: Date.now(),
        userEmail,
        type: "clean",
        severity,
        points,
      } satisfies ActivityEntry);
    });

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to submit proof" };
  }
}
