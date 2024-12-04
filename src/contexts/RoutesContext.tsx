import { Route } from '@/types/route';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface RoutesContextProps {
  routes: Route[];
}

const RoutesContext = createContext<RoutesContextProps | undefined>(undefined);

export const RoutesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const response = await fetch('/api/routes');
      const data = await response.json();
      setRoutes(data);
    };

    fetchRoutes();
  }, []);

  return (
    <RoutesContext.Provider value={{ routes }}>
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutes = () => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error('useRoutes must be used within a RoutesProvider');
  }
  return context;
};