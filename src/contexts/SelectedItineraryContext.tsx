import { Itinerary } from '@/app/ItineraryMapComponent';
import React, { createContext, useState, ReactNode } from 'react';


type ActiveComponent = 'navigation' | 'search-history' | 'saved-routes' | 'reports' | 'settings';

interface ProviderProps {
  children: ReactNode;
}

interface SelectedItineraryContextProps {
  selectedItinerary: Itinerary | null;
  setSelectedItinerary: (itinerary: Itinerary | null) => void;
  activeComponent: ActiveComponent;
  setActiveComponent: (component: ActiveComponent) => void;
}

export const SelectedItineraryContext = createContext<SelectedItineraryContextProps>({
  selectedItinerary: null,
  setSelectedItinerary: () => {},
  activeComponent: 'navigation',
  setActiveComponent: () => {},
});

export const SelectedItineraryProvider: React.FC<ProviderProps> = ({ children }) => {
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('navigation');

  return (
    <SelectedItineraryContext.Provider
      value={{
        selectedItinerary,
        setSelectedItinerary,
        activeComponent,
        setActiveComponent,
      }}
    >
      {children}
    </SelectedItineraryContext.Provider>
  );
};
