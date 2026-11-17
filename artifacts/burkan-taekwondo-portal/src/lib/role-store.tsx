import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AppRole = "parent" | "student" | "coach" | "admin";
export type RequestableRole = Exclude<AppRole, "admin">;
export type Role = AppRole | null;

/**
 * Where the signed-in person stands:
 * - loading:    Firebase is still restoring the session
 * - signed-out: nobody is signed in
 * - incomplete: signed in, but no access request exists yet
 * - pending:    access request waiting for an admin
 * - rejected:   an admin declined the request
 * - approved:   full access with `role`
 */
export type AuthStatus =
  | "loading"
  | "signed-out"
  | "incomplete"
  | "pending"
  | "rejected"
  | "approved";

export interface Account {
  uid: string;
  email: string;
  displayName: string;
  role: AppRole | null;
  requestedRole: RequestableRole | null;
}

interface UserProfileDoc {
  email?: string;
  displayName?: string;
  requestedRole?: RequestableRole;
  role?: AppRole | null;
  status?: "pending" | "approved" | "rejected";
}

type Result = { ok: true } | { ok: false; error: string };

interface RoleContextType {
  status: AuthStatus;
  role: Role;
  account: Account | null;
  firebaseUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<Result>;
  signup: (input: {
    fullName: string;
    email: string;
    password: string;
    requestedRole: RequestableRole;
  }) => Promise<Result>;
  submitAccessRequest: (
    fullName: string,
    requestedRole: RequestableRole,
  ) => Promise<Result>;
  resetPassword: (email: string) => Promise<Result>;
  resendVerification: () => Promise<Result>;
  switchView: (role: AppRole) => void;
  logout: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const VIEW_STORAGE_KEY = "burkan_admin_view";
const REQUESTABLE_ROLES: RequestableRole[] = ["parent", "student", "coach"];

export function friendlyAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "The email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "Choose a stronger password (at least 8 characters).";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "No connection. Check your internet and try again.";
    case "auth/unauthorized-domain":
      return "This website address is not allowed to sign in yet. Ask the admin to add it in Firebase.";
    case "permission-denied":
      return "That request was refused. Sign out and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function readStoredView(): AppRole | null {
  try {
    const value = localStorage.getItem(VIEW_STORAGE_KEY);
    return value === "admin" ||
      value === "parent" ||
      value === "student" ||
      value === "coach"
      ? value
      : null;
  } catch {
    return null;
  }
}

async function writeAccessRequest(
  user: User,
  fullName: string,
  requestedRole: RequestableRole,
) {
  if (!REQUESTABLE_ROLES.includes(requestedRole)) {
    throw new Error("Invalid role");
  }
  // Firestore rules only accept this exact shape: status "pending", no role.
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    displayName: fullName.trim(),
    requestedRole,
    role: null,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [viewRole, setViewRole] = useState<AppRole | null>(readStoredView);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeProfile?.();
      unsubscribeProfile = null;
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setStatus("signed-out");
        return;
      }

      setStatus("loading");
      unsubscribeProfile = onSnapshot(
        doc(db, "users", user.uid),
        (snapshot) => {
          if (!snapshot.exists()) {
            setProfile(null);
            setStatus("incomplete");
            return;
          }
          const data = snapshot.data() as UserProfileDoc;
          setProfile(data);
          if (data.status === "approved" && data.role) {
            setStatus("approved");
          } else if (data.status === "rejected") {
            setStatus("rejected");
          } else {
            setStatus("pending");
          }
        },
        () => {
          setProfile(null);
          setStatus("pending");
        },
      );
    });

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  const approvedRole: AppRole | null =
    status === "approved" ? (profile?.role ?? null) : null;
  const isAdmin = approvedRole === "admin";
  // Only an admin may preview the portal as another role. This is a display
  // choice; Firestore rules still check the real role.
  const role: Role = isAdmin ? (viewRole ?? "admin") : approvedRole;

  const account: Account | null = firebaseUser
    ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? profile?.email ?? "",
        displayName:
          profile?.displayName || firebaseUser.displayName || firebaseUser.email || "",
        role: approvedRole,
        requestedRole: profile?.requestedRole ?? null,
      }
    : null;

  const login: RoleContextType["login"] = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyAuthError(error) };
    }
  };

  const signup: RoleContextType["signup"] = async ({
    fullName,
    email,
    password,
    requestedRole,
  }) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await updateProfile(user, { displayName: fullName.trim() });
      await writeAccessRequest(user, fullName, requestedRole);
      sendEmailVerification(user).catch(() => undefined);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyAuthError(error) };
    }
  };

  const submitAccessRequest: RoleContextType["submitAccessRequest"] = async (
    fullName,
    requestedRole,
  ) => {
    const user = auth.currentUser;
    if (!user) return { ok: false, error: "Sign in first." };
    try {
      await writeAccessRequest(user, fullName, requestedRole);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyAuthError(error) };
    }
  };

  const resetPassword: RoleContextType["resetPassword"] = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { ok: true };
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String((error as { code: unknown }).code)
          : "";
      // Don't reveal whether an email has an account.
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        return { ok: true };
      }
      return { ok: false, error: friendlyAuthError(error) };
    }
  };

  const resendVerification: RoleContextType["resendVerification"] = async () => {
    const user = auth.currentUser;
    if (!user) return { ok: false, error: "Sign in first." };
    try {
      await sendEmailVerification(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyAuthError(error) };
    }
  };

  const switchView = (nextRole: AppRole) => {
    if (!isAdmin) return;
    setViewRole(nextRole);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, nextRole);
    } catch {
      // Storage can be unavailable (private mode); the view still switches.
    }
  };

  const logout = async () => {
    setViewRole(null);
    try {
      localStorage.removeItem(VIEW_STORAGE_KEY);
      // Clean up the old demo session keys if they are still around.
      localStorage.removeItem("burkan_demo_session");
      localStorage.removeItem("burkan_role");
    } catch {
      // ignore
    }
    await signOut(auth);
  };

  return (
    <RoleContext.Provider
      value={{
        status,
        role,
        account,
        firebaseUser,
        isAuthenticated: status === "approved",
        isAdmin,
        login,
        signup,
        submitAccessRequest,
        resetPassword,
        resendVerification,
        switchView,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
