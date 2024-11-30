import { Line, Station } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface LinesStationsContextProps {
    lines: Line[];
    stations: Station[];
}

const LinesStationsContext = createContext<LinesStationsContextProps | undefined>(undefined);

export const LinesStationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    const fetchLines = async () => {
      const response = await fetch('/api/lines');
      const data = await response.json();
      setLines(data);
    };

    const fetchStations = async () => {
      const response = await fetch('/api/stations');
      const data = await response.json();
      setStations(data);
    };

    fetchLines();
    fetchStations();
  }, []);

  return (
    <LinesStationsContext.Provider value={{ lines, stations }}>
      {children}
    </LinesStationsContext.Provider>
  );
};

export const useLinesStations = () => {
  const context = useContext(LinesStationsContext);
  if (!context) {
    throw new Error('useLinesStations must be used within a LinesStationsProvider');
  }
  return context;
};