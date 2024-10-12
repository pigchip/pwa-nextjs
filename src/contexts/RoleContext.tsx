import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { parseCookies, setCookie } from 'nookies';

type Role = 'admin' | 'user' | 'supervisor';

interface RoleContextProps {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const cookies = parseCookies();
  const initialRole = cookies.role ? (cookies.role as Role) : 'user';
  const [role, setRole] = useState<Role>(initialRole);

  useEffect(() => {
    // Save role in cookies
    setCookie(null, 'role', role, { path: '/' });
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};