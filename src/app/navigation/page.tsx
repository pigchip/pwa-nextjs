"use client";

import React, { useState, useEffect, useContext } from 'react';
import AutoComplete from '../AutoComplete';
import ItineraryMapComponent from '../ItineraryMapComponent';
import 'leaflet/dist/leaflet.css';
import '../globals.css';
import { SelectedItineraryContext } from '../contexts/SelectedItineraryContext';
import Layout from '@/components/Layout';

const NavigationComponent: React.FC = () => {
  // Accede al contexto para obtener el itinerario seleccionado y su función de actualización.
  const {
    selectedItinerary,
    setSelectedItinerary,
  } = useContext(SelectedItineraryContext);

  // Define el estado para las ubicaciones de inicio y destino que se utilizarán en el mapa.
  const [startLocation, setStartLocation] = useState<{ lat: number; lon: number; name: string; display_name: string } | null>(null);
  const [endLocation, setEndLocation] = useState<{ lat: number; lon: number; name: string; display_name: string } | null>(null);

  useEffect(() => {
    // Si hay un itinerario seleccionado, usa sus coordenadas y nombres para startLocation y endLocation.
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
    // Si no hay un itinerario seleccionado, `startLocation` y `endLocation` no se cambian.
  }, [selectedItinerary]);

  // Maneja la selección del punto de inicio en el componente `AutoComplete`.
  const handleSelectStart = (location: { lat: number; lon: number; display_name: string } | null) => {
    if (location) {
      // Actualiza la ubicación de inicio seleccionada manualmente
      setStartLocation({ ...location, name: location.display_name });
      setSelectedItinerary(null);
    } else {
      // Si la ubicación es `null`, limpia `startLocation`
      setStartLocation(null);
    }
  };
  

  // Maneja la selección del punto de destino en el componente `AutoComplete`.
  const handleSelectEnd = (location: { lat: number; lon: number; display_name: string } | null) => {
    if (location) {
      // Almacena la nueva ubicación de destino seleccionada manualmente.
      setEndLocation({ ...location, name: location.display_name });
      // Reinicia el itinerario seleccionado a `null` para forzar el uso de la ubicación manual.
      setSelectedItinerary(null);
    }
  };

  return (
    <Layout>
    // Estructura de la interfaz de usuario principal con un contenedor que ocupa todo el espacio disponible.
    <div className="relative flex flex-col h-full bg-gray-100" style={{ height: '100%' }}>
      {/* Sección de inputs para seleccionar inicio y destino */}
      <div className="relative flex-grow">
        {/* Componente `AutoComplete` para seleccionar el punto de inicio. */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
        <AutoComplete
  // Si hay un itinerario seleccionado, pasa su `startNameIti`, de lo contrario pasa una cadena vacía.
  value={selectedItinerary?.startNameIti === "Mi Ubicación" ? '' : selectedItinerary?.startNameIti || ''}
  placeholder="Mi Ubicación"
  onSelect={handleSelectStart}
/>

        </div>
        {/* Componente `AutoComplete` para seleccionar el punto de destino. */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
        <AutoComplete
  // Si hay un itinerario seleccionado, pasa su `endNameIti`, de lo contrario pasa una cadena vacía.
  value={selectedItinerary?.endNameIti || ''}
  placeholder="Destino"
  onSelect={handleSelectEnd}
/>

        </div>
        {/* Componente del Mapa que recibe las ubicaciones de inicio y destino. */}
        <ItineraryMapComponent startLocation={startLocation} endLocation={endLocation} />
      </div>
    </div>
    </Layout>
  );
};

export default NavigationComponent;
