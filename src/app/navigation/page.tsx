"use client";

import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
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

  const [startName, setStartName] = useState<string>('');
  const [endName, setEndName] = useState<string>('');

  useEffect(() => {
    if (startLocation) {
      setStartName(startLocation.display_name || '');
    }
    if (endLocation) {
      setEndName(endLocation.display_name || '');
    }
  }, [startLocation, endLocation]);
  

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

  const searchParams = useSearchParams();

  useEffect(() => {
    const startLat = searchParams.get('startLat');
    const startLon = searchParams.get('startLon');
    const startName = searchParams.get('startName');
    const startDisplayName = searchParams.get('startDisplayName');
    const endLat = searchParams.get('endLat');
    const endLon = searchParams.get('endLon');
    const endName = searchParams.get('endName');
    const endDisplayName = searchParams.get('endDisplayName');

    if (startLat && startLon && startName && startDisplayName) {
      setStartLocation({
        lat: parseFloat(startLat),
        lon: parseFloat(startLon),
        name: startName,
        display_name: startDisplayName,
      });
    }
    if (endLat && endLon && endName && endDisplayName) {
      setEndLocation({
        lat: parseFloat(endLat),
        lon: parseFloat(endLon),
        name: endName,
        display_name: endDisplayName,
      });
    }
  }, [searchParams]);

  const handleSelectStart = (location: { lat: number; lon: number; display_name: string } | null) => {
    if (location) {
      setStartLocation({ ...location, name: location.display_name });
      setStartName(location.display_name || '');
      setSelectedItinerary(null); // Reset selected itinerary if needed
    } else {
      setStartLocation(null);
      setStartName('');
    }
  };
  
  const handleSelectEnd = (location: { lat: number; lon: number; display_name: string } | null) => {
    if (location) {
      setEndLocation({ ...location, name: location.display_name });
      setEndName(location.display_name || '');
      setSelectedItinerary(null); // Reset selected itinerary if needed
    } else {
      setEndLocation(null);
      setEndName('');
    }
  }; 

  return (
    <Layout>
      <div className="relative flex flex-col h-full bg-gray-100" style={{ height: '100%' }}>
        <div className="relative flex-grow">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
          <AutoComplete
  value={startName || ''}
  placeholder="Mi Ubicación"
  onSelect={handleSelectStart}
/>
          </div>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
          <AutoComplete
  value={endName || ''}
  placeholder="Destino"
  onSelect={handleSelectEnd}
/>
          </div>
          <ItineraryMapComponent startLocation={startLocation} endLocation={endLocation} />
        </div>
        {/* Floating Share Location Button */}
        <div className="absolute bottom-4 right-4 z-50">
          <button
            className="bg-[#6ABDA6] text-white p-3 rounded-full shadow-lg hover:bg-[#5aa18e] focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    const shareUrl = new URL(window.location.href);
                    shareUrl.pathname = "/navigation";
                    shareUrl.searchParams.set("endLat", latitude.toString());
                    shareUrl.searchParams.set("endLon", longitude.toString());
                    shareUrl.searchParams.set("endName", "Ubicación compartida");
                    shareUrl.searchParams.set("endDisplayName", "Ubicación compartida");

                    if (navigator.share) {
                      navigator
                        .share({
                          title: "Mi Ubicación Actual",
                          text: "Aquí me encuentro",
                          url: shareUrl.toString(),
                        })
                        .catch((error) => console.error("Error compartiendo", error));
                    } else {
                      alert("Compartir no es soportado en este dispositivo");
                    }
                  },
                  (error) => {
                    console.error("Error obteniendo ubicación", error);
                    alert("No se pudo obtener tu ubicación. Asegúrate de permitir el acceso.");
                  }
                );
              } else {
                alert("Geolocalización no es soportada en este dispositivo");
              }
            }}
          >
            <ShareLocationIcon />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default NavigationComponent;