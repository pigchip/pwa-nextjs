// stores/useLineStations.ts
import { create } from 'zustand';
import { Station } from '@/types/station';

interface LineStationsState {
  lineStations: { [key: number]: Station[] };
  fetchStationsForLine: (lineId: number) => Promise<void>;
}

export const useLineStationsStore = create<LineStationsState>((set) => ({
  lineStations: {},
  fetchStationsForLine: async (lineId: number) => {
    try {
      const response = await fetch(`/api/lines/${lineId}/stations`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stations for line ${lineId}`);
      }
      const stations: Station[] = await response.json();
      set((state) => ({
        lineStations: {
          ...state.lineStations,
          [lineId]: stations,
        },
      }));
    } catch (error) {
      console.error(`Error fetching stations for line ${lineId}:`, error);
    }
  },
}));