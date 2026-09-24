export type DemoRole = "parent" | "student" | "coach" | "admin";

export interface DemoAccount {
  email: string;
  displayName: string;
  role: DemoRole;
}

export interface DemoStudent {
  id: string;
  email: string;
  fullName: string;
}

export interface ChildProfile {
  id: string;
  fullName: string;
  parentEmail: string;
  createdAt: string;
}

export const DEMO_PASSWORD = "123456";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "zaid@burkantkd.com", displayName: "Zaid", role: "admin" },
  { email: "osaid@burkantkd.com", displayName: "Osaid Sqoor", role: "coach" },
  { email: "suhaib@burkantkd.com", displayName: "Suhaib Atwan", role: "coach" },
  { email: "parent@burkantkd.com", displayName: "Parent", role: "parent" },
  { email: "islam@burkantkd.com", displayName: "Islam El Natsheh", role: "student" },
  { email: "sarah@burkantkd.com", displayName: "Sarah Abujaish", role: "student" },
  { email: "ryan@burkantkd.com", displayName: "Ryan Abu El-Rob", role: "student" },
  { email: "rama@burkantkd.com", displayName: "Rama Abu El-Rob", role: "student" },
];

export const DEMO_STUDENTS: DemoStudent[] = [
  { id: "islam", email: "islam@burkantkd.com", fullName: "Islam El Natsheh" },
  { id: "sarah", email: "sarah@burkantkd.com", fullName: "Sarah Abujaish" },
  { id: "ryan", email: "ryan@burkantkd.com", fullName: "Ryan Abu El-Rob" },
  { id: "rama", email: "rama@burkantkd.com", fullName: "Rama Abu El-Rob" },
];

export const DEMO_COACHES = DEMO_ACCOUNTS.filter(
  (account) => account.role === "coach",
);

const ROSTER_STORAGE_KEY = "burkan_demo_roster_assignments";
const CHILD_PROFILE_STORAGE_KEY = "burkan_demo_child_profiles";
const INITIAL_ROSTER_ASSIGNMENTS: Record<string, string> = {
  ryan: "suhaib@burkantkd.com",
};

export function authenticateDemoAccount(
  email: string,
  password: string,
): DemoAccount | null {
  if (password !== DEMO_PASSWORD) return null;
  return (
    DEMO_ACCOUNTS.find(
      (account) => account.email === email.trim().toLowerCase(),
    ) ?? null
  );
}

export function getRosterAssignments(): Record<string, string> {
  const assignments = { ...INITIAL_ROSTER_ASSIGNMENTS };
  try {
    const stored = localStorage.getItem(ROSTER_STORAGE_KEY);
    if (!stored) return assignments;

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return assignments;

    for (const [studentId, coachEmail] of Object.entries(parsed)) {
      if (
        DEMO_STUDENTS.some((student) => student.id === studentId) &&
        DEMO_COACHES.some((coach) => coach.email === coachEmail)
      ) {
        assignments[studentId] = coachEmail;
      }
    }
  } catch {
    return assignments;
  }
  return assignments;
}

export function assignStudentToCoach(
  studentId: string,
  coachEmail: string,
): { ok: true; assignments: Record<string, string> } | { ok: false; coachEmail: string } {
  const assignments = getRosterAssignments();
  const currentCoach = assignments[studentId];
  if (currentCoach && currentCoach !== coachEmail) {
    return { ok: false, coachEmail: currentCoach };
  }
  if (!DEMO_STUDENTS.some((student) => student.id === studentId)) {
    return { ok: false, coachEmail: "" };
  }

  assignments[studentId] = coachEmail;
  localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(assignments));
  window.dispatchEvent(new CustomEvent("burkan:roster-updated"));
  return { ok: true, assignments };
}

export function getChildProfiles(parentEmail: string): ChildProfile[] {
  try {
    const stored = localStorage.getItem(CHILD_PROFILE_STORAGE_KEY);
    if (!stored) return [];
    const profiles: unknown = JSON.parse(stored);
    if (!Array.isArray(profiles)) return [];
    return profiles.filter(
      (profile): profile is ChildProfile =>
        Boolean(profile) &&
        typeof profile === "object" &&
        "parentEmail" in profile &&
        profile.parentEmail === parentEmail,
    );
  } catch {
    return [];
  }
}

export function createChildProfile(
  parentEmail: string,
  fullName: string,
): ChildProfile {
  const profile: ChildProfile = {
    id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fullName: fullName.trim(),
    parentEmail,
    createdAt: new Date().toISOString(),
  };
  const profiles = readAllChildProfiles();
  profiles.push(profile);
  localStorage.setItem(CHILD_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  return profile;
}

function readAllChildProfiles(): ChildProfile[] {
  try {
    const stored = localStorage.getItem(CHILD_PROFILE_STORAGE_KEY);
    if (!stored) return [];
    const profiles: unknown = JSON.parse(stored);
    return Array.isArray(profiles) ? (profiles as ChildProfile[]) : [];
  } catch {
    return [];
  }
}