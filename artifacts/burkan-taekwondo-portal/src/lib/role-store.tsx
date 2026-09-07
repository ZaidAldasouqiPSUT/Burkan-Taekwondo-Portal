import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Role = 'parent' | 'student' | 'coach' | 'admin' | null;

interface RoleContextType {
  role: Role;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('burkan_role');
    return (saved as Role) || null;
  });

  const isAuthenticated = role !== null;

  const login = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('burkan_role', newRole as string);
  };

  const logout = () => {
    setRoleState(null);
    localStorage.removeItem('burkan_role');
  };

  return (
    <RoleContext.Provider value={{ role, isAuthenticated, login, logout }}>
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
