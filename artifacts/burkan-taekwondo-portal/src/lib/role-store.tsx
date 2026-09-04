import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Role = 'parent' | 'student' | 'coach' | 'admin';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('burkan_role');
    return (saved as Role) || 'student';
  });

  useEffect(() => {
    localStorage.setItem('burkan_role', role);
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole: setRoleState }}>
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
