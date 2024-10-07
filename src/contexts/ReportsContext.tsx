import { Register } from '@/types/register';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ReportsContextProps {
  reports: Register[];
  selectedReport: Register | null;
  setReports: (reports: Register[]) => void;
  setSelectedReport: (report: Register | null) => void;
}

const ReportsContext = createContext<ReportsContextProps | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Register[]>([]);
  const [selectedReport, setSelectedReport] = useState<Register | null>(null);

  return (
    <ReportsContext.Provider value={{ reports, selectedReport, setReports, setSelectedReport }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = (): ReportsContextProps => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};