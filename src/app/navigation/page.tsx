"use client";

import React, { useState, useEffect, useContext } from 'react';
import AutoComplete from '../AutoComplete';
import 'leaflet/dist/leaflet.css';
import '../globals.css';
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';
import { SelectedItineraryContext } from '@/contexts/SelectedItineraryContext';

const ItineraryMapComponent = dynamic(() => import('../ItineraryMapComponent'), { ssr: false });

const NavigationComponent: React.FC = () => {
  const {
    selectedItinerary,
    setSelectedItinerary,
  } = useContext(SelectedItineraryContext);

  const [startLocation, setStartLocation] = useState<{ lat: number; lon: number; name: string; display_name: string } | null>(null);
  const [endLocation, setEndLocation] = useState<{ lat: number; lon: number; name: string; display_name: string } | null>(null);

  useEffect(() => {
    if (selectedItinerary) {
      const newStart = {
        lat: selectedItinerary.legs[0].from.lat,
        lon: selectedItinerary.legs[0].from.lon,
        name: selectedItinerary.startNameIti ?? '',
        display_name: selectedItinerary.startNameIti ?? '',
      };
      const newEnd = {
        lat: selectedItinerary.legs[selectedItinerary.legs.length - 1].to.lat,
        lon: selectedItinerary.legs[selectedItinerary.legs.length - 1].to.lon,
        name: selectedItinerary.endNameIti ?? '',
        display_name: selectedItinerary.endNameIti ?? '',
      };
      setStartLocation(newStart);
      setEndLocation(newEnd);
    }
  }, [selectedItinerary]);

  const handleSelectStart = (location: { lat: number; lon: number; display_name: string } | null) => {
    if (location) {
      setStartLocation({ ...location, name: location.display_name });
      setSelectedItinerary(null);
    } else {
      setStartLocation(null);
    }
  };

  const handleSelectEnd = (location: { lat: number; lon: number; display_name: string } | null) => {
    if (location) {
      setEndLocation({ ...location, name: location.display_name });
      setSelectedItinerary(null);
    }
  };

  return (
    <Layout>
      <div className="relative flex flex-col h-full bg-gray-100" style={{ height: '100%' }}>
        <div className="relative flex-grow">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
            <AutoComplete
              value={selectedItinerary?.startNameIti === "Mi Ubicación" ? '' : selectedItinerary?.startNameIti || ''}
              placeholder="Mi Ubicación"
              onSelect={handleSelectStart}
            />
          </div>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
            <AutoComplete
              value={selectedItinerary?.endNameIti || ''}
              placeholder="Destino"
              onSelect={handleSelectEnd}
            />
          </div>
          <ItineraryMapComponent startLocation={startLocation} endLocation={endLocation} />
        </div>
      </div>
    </Layout>
  );
};

export default NavigationComponent;