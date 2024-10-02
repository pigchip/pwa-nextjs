"use client";

import React, { useState } from 'react';
import AutoComplete from '../AutoComplete'; // Componente de autocompletado (opcional)
import MapComponent from '../MapComponent';
import 'leaflet/dist/leaflet.css'; // Importa los estilos aquí
import '../globals.css'; // Si tienes estilos globales
import Layout from '@/components/Layout';

const NavigationComponent: React.FC = () => {
  const [startLocation, setStartLocation] = React.useState<{ lat: number, lon: number } | null>(null);
  const [endLocation, setEndLocation] = React.useState<{ lat: number, lon: number } | null>(null);
  
  return (
    <Layout>
    <div className="relative flex flex-col h-full bg-gray-100" style={{ height: '100%' }}>
      {/* Sección del mapa */}
      <div className="relative flex-grow">
        {/* Autocompletar Inicio - Posicionamos encima del mapa con transparencia y menor ancho */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
          <AutoComplete placeholder="Mi Ubicación" onSelect={setStartLocation} />
        </div>

        {/* Autocompletar Destino - Posicionamos encima del mapa con transparencia y menor ancho */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
          <AutoComplete placeholder="Destino" onSelect={setEndLocation} />
        </div>

        {/* Componente del Mapa */}
        <MapComponent startLocation={startLocation} endLocation={endLocation} />
      </div>
    </div>
    </Layout>
  );
};

export default NavigationComponent;
