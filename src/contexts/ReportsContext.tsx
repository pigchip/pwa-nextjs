import { Register } from '@/types/register';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface ReportsContextProps {
  reports: Register[];
  selectedReport: Register | null;
  setReports: (reports: Register[]) => void;
  setSelectedReport: (report: Register | null) => void;
  fetchReports: () => Promise<Register[]>;
  updateReport: (updatedReport: Register) => void; // Add this line
}

const ReportsContext = createContext<ReportsContextProps | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Register[]>([]);
  const [selectedReport, setSelectedReport] = useState<Register | null>(null);

  const fetchReports = async (): Promise<Register[]> => {
    try {
      const reportsResponse = await fetch(`/api/reports`);
      if (!reportsResponse.ok) {
        throw new Error('Failed to fetch reports');
      }
      const reportsData = await reportsResponse.json();
      console.log('Fetched reports:', reportsData); 
      return reportsData.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const updateReport = (updatedReport: Register) => {
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
  };

  useEffect(() => {
    const initializeReports = async () => {
      const initialReports = await fetchReports();
      setReports(initialReports);
    };
    initializeReports();
  }, []);

  return (
    <ReportsContext.Provider value={{ reports, selectedReport, setReports, setSelectedReport, fetchReports, updateReport }}>
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