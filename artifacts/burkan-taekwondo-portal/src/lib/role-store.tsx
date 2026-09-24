import { createContext, useContext, useState, ReactNode } from "react";
import {
  authenticateDemoAccount,
  DEMO_ACCOUNTS,
  type DemoAccount,
  type DemoRole,
} from "@/lib/mock-database";

export type Role = DemoRole | null;
type ViewRole = Exclude<Role, null>;

interface RoleContextType {
  role: Role;
  account: DemoAccount | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  switchView: (role: ViewRole) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface StoredSession {
  account: DemoAccount;
  activeRole: ViewRole;
}

function readStoredSession(): StoredSession | null {
  try {
    const stored = localStorage.getItem("burkan_demo_session");
    if (!stored) return null;
    const parsed = JSON.parse(stored) as {
      email?: string;
      activeRole?: ViewRole;
    };
    const account = DEMO_ACCOUNTS.find(
      (item) => item.email === parsed.email?.toLowerCase(),
    );
    if (!account) return null;

    const adminViews: ViewRole[] = ["admin", "student", "parent", "coach"];
    const activeRole =
      account.role === "admin" && adminViews.includes(parsed.activeRole as ViewRole)
        ? (parsed.activeRole as ViewRole)
        : account.role;
    return { account, activeRole };
  } catch {
    return null;
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() =>
    readStoredSession(),
  );

  const login = (email: string, password: string) => {
    const account = authenticateDemoAccount(email, password);
    if (!account) return false;

    const nextSession = { account, activeRole: account.role };
    setSession(nextSession);
    localStorage.setItem(
      "burkan_demo_session",
      JSON.stringify({ email: account.email, activeRole: account.role }),
    );
    localStorage.removeItem("burkan_role");
    return true;
  };

  const switchView = (nextRole: ViewRole) => {
    if (!session || session.account.role !== "admin") return;
    const nextSession = { ...session, activeRole: nextRole };
    setSession(nextSession);
    localStorage.setItem(
      "burkan_demo_session",
      JSON.stringify({
        email: session.account.email,
        activeRole: nextRole,
      }),
    );
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("burkan_demo_session");
    localStorage.removeItem("burkan_role");
  };

  const role = session?.activeRole ?? null;
  const account = session?.account ?? null;
  const isAuthenticated = account !== null;
  const isAdmin = account?.role === "admin";

  return (
    <RoleContext.Provider
      value={{
        role,
        account,
        isAuthenticated,
        isAdmin,
        login,
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
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
