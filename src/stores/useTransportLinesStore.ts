import { create } from 'zustand';
import { Line } from '@/types/line';
import { TransportName } from '@/types/transport';

interface TransportLinesState {
  lines: Line[];
  loading: boolean;
  error: string | null;
  fetchTransportLines: (name: TransportName) => Promise<void>;
}

export const useTransportLinesStore = create<TransportLinesState>((set) => ({
  lines: [],
  loading: false,
  error: null,
  fetchTransportLines: async (name: TransportName) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/transports/lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch transport lines');
      }

      const data: Line[] = await response.json();
      set({ lines: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));