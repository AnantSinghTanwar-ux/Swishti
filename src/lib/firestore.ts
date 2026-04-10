import { ActivityEntry, Report, Severity, Status, UserProfile } from "./types";
import { generateId } from "./utils";
import { pointsForSeverity } from "./scoring";

type Listener<T> = (value: T) => void;

const reportsListeners = new Set<Listener<Report[]>>();
const activityListeners = new Set<Listener<ActivityEntry[]>>();
const leaderboardListeners = new Set<Listener<UserProfile[]>>();

let reports: Report[] = [];
let activity: ActivityEntry[] = [];
let leaderboard: UserProfile[] = [];
let seeded = false;

function cloneReports() {
  return reports.map((report) => ({ ...report }));
}

function cloneActivity() {
  return activity.map((entry) => ({ ...entry }));
}

function cloneLeaderboard() {
  return leaderboard.map((user) => ({ ...user }));
}

function emitReports() {
  const snapshot = cloneReports();
  reportsListeners.forEach((listener) => listener(snapshot));
}

function emitActivity() {
  const snapshot = cloneActivity();
  activityListeners.forEach((listener) => listener(snapshot));
}

function emitLeaderboard() {
  const snapshot = cloneLeaderboard();
  leaderboardListeners.forEach((listener) => listener(snapshot));
}

function emitAll() {
  emitReports();
  emitActivity();
  emitLeaderboard();
}

function sortLeaderboard() {
  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints || b.cleanupCount - a.cleanupCount || a.email.localeCompare(b.email));

  leaderboard = leaderboard.map((user, index) => {
    const nextUser = { ...user };
    delete nextUser.badge;
    if (index === 0 && nextUser.totalPoints > 0) nextUser.badge = "Top Cleaner";
    else if (index <= 2 && nextUser.totalPoints > 0) nextUser.badge = "Rising Star";
    return nextUser;
  });
}

function upsertLeaderboardUser(email: string, updates?: Partial<UserProfile>) {
  const existing = leaderboard.find((user) => user.email === email);
  if (existing) {
    Object.assign(existing, updates);
    return existing;
  }
  const user: UserProfile = {
    email,
    totalPoints: 0,
    cleanupCount: 0,
    ...updates,
  };
  leaderboard.push(user);
  return user;
}

function addActivity(entry: Omit<ActivityEntry, "id">) {
  activity.unshift({ ...entry, id: generateId() });
  activity = activity.slice(0, 50);
}

const DUMMY_REPORTS: Omit<Report, "id">[] = [
  {
    lat: 13.05,
    lng: 80.2824,
    beforeImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
    severity: "high",
    status: "reported",
    createdAt: Date.now() - 3600000 * 2,
    createdBy: "chennai.citizen@example.com",
  },
  {
    lat: 13.0418,
    lng: 80.2341,
    beforeImage: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400",
    severity: "medium",
    status: "reported",
    createdAt: Date.now() - 3600000 * 5,
    createdBy: "volunteer2@example.com",
  },
  {
    lat: 13.04205,
    lng: 80.23425,
    beforeImage: "https://images.unsplash.com/photo-1528323273322-d81458248d40?w=400",
    severity: "low",
    status: "reported",
    createdAt: Date.now() - 3600000 * 4.7,
    createdBy: "citizen.nearby@example.com",
  },
  {
    lat: 13.0012,
    lng: 80.2565,
    beforeImage: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400",
    severity: "low",
    status: "in_progress",
    createdAt: Date.now() - 3600000 * 8,
    createdBy: "john.doe@example.com",
    claimedBy: "volunteer@example.com",
  },
  {
    lat: 13.0339,
    lng: 80.2707,
    beforeImage: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400",
    severity: "high",
    status: "reported",
    createdAt: Date.now() - 3600000 * 1,
    createdBy: "jane.smith@example.com",
  },
  {
    lat: 13.085,
    lng: 80.2101,
    beforeImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
    severity: "medium",
    status: "cleaned",
    createdAt: Date.now() - 3600000 * 24,
    createdBy: "local.hero@example.com",
    claimedBy: "volunteer@example.com",
    cleanedAt: Date.now() - 3600000 * 12,
    afterImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
  },
  {
    lat: 13.0872,
    lng: 80.2092,
    beforeImage: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400",
    severity: "high",
    status: "pending_proof",
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

function seedLocalData() {
  if (seeded) return;
  seeded = true;

  reports = DUMMY_REPORTS.map((report) => ({
    ...report,
    id: `rpt-${generateId()}`,
  }));

  activity = [
    {
      id: generateId(),
      action: "Report submitted — High severity at Marina Beach",
      reportId: reports[0]?.id ?? "rpt-001",
      timestamp: Date.now() - 3600000 * 2,
      userEmail: "chennai.citizen@example.com",
      type: "report",
      severity: "high",
    },
    {
      id: generateId(),
      action: "Report submitted — Medium severity at T. Nagar",
      reportId: reports[1]?.id ?? "rpt-002",
      timestamp: Date.now() - 3600000 * 5,
      userEmail: "volunteer2@example.com",
      type: "report",
      severity: "medium",
    },
    {
      id: generateId(),
      action: "Report claimed for cleanup at Adyar",
      reportId: reports[3]?.id ?? "rpt-003",
      timestamp: Date.now() - 3600000 * 7,
      userEmail: "volunteer@example.com",
      type: "claim",
      severity: "low",
    },
    {
      id: generateId(),
      action: "Report submitted — High severity at Mylapore",
      reportId: reports[4]?.id ?? "rpt-004",
      timestamp: Date.now() - 3600000 * 1,
      userEmail: "jane.smith@example.com",
      type: "report",
      severity: "high",
    },
    {
      id: generateId(),
      action: "Report marked as cleaned at Anna Nagar",
      reportId: reports[5]?.id ?? "rpt-005",
      timestamp: Date.now() - 3600000 * 12,
      userEmail: "volunteer@example.com",
      type: "clean",
      severity: "medium",
      points: pointsForSeverity("medium"),
    },
  ];

  leaderboard = SEED_USERS.map((user) => ({ ...user }));
  sortLeaderboard();
}

export async function seedIfEmpty(): Promise<void> {
  seedLocalData();
  emitAll();
}

export function subscribeToReports(callback: (reports: Report[]) => void) {
  reportsListeners.add(callback);
  seedLocalData();
  callback(cloneReports());
  return () => reportsListeners.delete(callback);
}

export function subscribeToActivity(callback: (activity: ActivityEntry[]) => void) {
  activityListeners.add(callback);
  seedLocalData();
  callback(cloneActivity());
  return () => activityListeners.delete(callback);
}

export function subscribeToLeaderboard(callback: (users: UserProfile[]) => void) {
  leaderboardListeners.add(callback);
  seedLocalData();
  callback(cloneLeaderboard());
  return () => leaderboardListeners.delete(callback);
}

export async function ensureUserProfile(email: string): Promise<void> {
  seedLocalData();
  upsertLeaderboardUser(email, { totalPoints: 0, cleanupCount: 0 });
  sortLeaderboard();
  emitLeaderboard();
}

export async function addReportToFirestore(
  report: Omit<Report, "id" | "status" | "createdAt" | "createdBy" | "claimedBy" | "afterImage" | "cleanedAt">,
  userEmail: string
): Promise<string> {
  seedLocalData();
  const id = `rpt-${generateId()}`;
  const newReport: Report = {
    ...report,
    id,
    status: "reported",
    createdAt: Date.now(),
    createdBy: userEmail,
  };

  reports = [newReport, ...reports];

  addActivity({
    action: `New report by ${userEmail}`,
    reportId: id,
    timestamp: Date.now(),
    userEmail,
    type: "report",
    severity: report.severity,
  });

  emitAll();
  return id;
}

export async function claimReportInFirestore(
  reportId: string,
  volunteerEmail: string
): Promise<{ success: boolean; error?: string }> {
  seedLocalData();
  const report = reports.find((entry) => entry.id === reportId);
  if (!report) return { success: false, error: "Report not found" };
  if (report.status !== "reported") return { success: false, error: "Report already claimed or cleaned" };
  if (report.claimedBy) return { success: false, error: "Report already claimed" };

  report.status = "in_progress";
  report.claimedBy = volunteerEmail;

  addActivity({
    reportId,
    timestamp: Date.now(),
    userEmail: volunteerEmail,
    type: "claim",
    severity: report.severity,
    action: `Report claimed for cleanup by ${volunteerEmail}`,
  });

  upsertLeaderboardUser(volunteerEmail, { email: volunteerEmail });
  sortLeaderboard();
  emitAll();
  return { success: true };
}

export async function initiatePendingProof(
  reportId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  seedLocalData();
  const report = reports.find((entry) => entry.id === reportId);
  if (!report) return { success: false, error: "Report not found" };
  if (!report.beforeImage) return { success: false, error: "Report is missing BEFORE image" };
  if (report.status !== "in_progress") return { success: false, error: "Report must be in progress" };
  if (report.claimedBy !== userEmail) return { success: false, error: "Only the claimer can mark cleaned" };

  report.status = "pending_proof";
  emitReports();
  return { success: true };
}

export async function submitCleanupProof(
  reportId: string,
  afterImageUrl: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  seedLocalData();
  const report = reports.find((entry) => entry.id === reportId);
  if (!report) return { success: false, error: "Report not found" };
  if (report.claimedBy !== userEmail) return { success: false, error: "Only the claimer can submit proof" };
  if (report.status !== "pending_proof") return { success: false, error: "Report must be pending proof to finalize" };
  if (report.afterImage) return { success: false, error: "AFTER image already submitted" };

  const points = pointsForSeverity(report.severity) || 10;
  report.status = "cleaned";
  report.afterImage = afterImageUrl;
  report.cleanedAt = Date.now();

  const user = upsertLeaderboardUser(userEmail, { email: userEmail });
  user.totalPoints += points;
  user.cleanupCount += 1;

  addActivity({
    reportId,
    timestamp: Date.now(),
    userEmail,
    type: "proof",
    severity: report.severity,
    points,
    action: `Cleanup proof uploaded by ${userEmail}`,
  });

  addActivity({
    reportId,
    timestamp: Date.now(),
    userEmail,
    type: "clean",
    severity: report.severity,
    points,
    action: `Report marked as cleaned by ${userEmail}`,
  });

  sortLeaderboard();
  emitAll();
  return { success: true };
}
