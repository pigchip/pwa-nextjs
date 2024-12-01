"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./Mapx"), { ssr: false });

const TransfersList: React.FC<{ routeData: any }> = ({ routeData }) => {
  if (!routeData || !routeData.legs) return null;

  return (
    <div className="mt-4 w-full max-w-2xl bg-white shadow-lg rounded-lg p-4 md:px-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Detalles del Itinerario</h2>
      <ul className="space-y-4 overflow-auto max-h-96 md:max-h-full">
        {routeData.legs.map((leg: any, index: number) => (
          <li
            key={index}
            className="border-b border-gray-200 pb-4 last:border-b-0"
          >
            <p className="text-sm md:text-base text-gray-600">
              <strong>Modo:</strong> {leg.mode}
            </p>
            <p className="text-sm md:text-base text-gray-600">
              <strong>Desde:</strong> {leg.from.name}
            </p>
            <p className="text-sm md:text-base text-gray-600">
              <strong>Hasta:</strong> {leg.to.name}
            </p>
            <p className="text-sm md:text-base text-gray-600">
              <strong>Duración:</strong> {Math.round(leg.duration / 60)} minutos
            </p>
            {leg.route && (
              <p className="text-sm md:text-base text-gray-600">
                <strong>Ruta:</strong> {leg.route.shortName} - {" "}
                {leg.route.longName}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const OfflinePage: React.FC = () => {
  const [routeData, setRouteData] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const jsonData = JSON.parse(content);
          setRouteData(jsonData);
        } catch (error) {
          alert("El archivo no tiene un formato JSON válido.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-2xl md:text-4xl font-bold mb-4">Estás desconectado</h1>
      <p className="text-sm md:text-lg">Por favor, revisa tu conexión a Internet.</p>
      <p className="mt-2 text-xs md:text-sm text-gray-500">
        Esta página está disponible gracias al almacenamiento en caché.
      </p>
      <img
        src="/icon-144.png"
        alt="Offline Icon"
        className="mt-4 w-16 h-16 md:w-24 md:h-24"
      />
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="mt-4 p-2 border border-gray-300 rounded w-full max-w-md"
      />
      <div className="w-full h-72 md:h-96 mt-4">
        <MapComponent routeData={routeData} />
      </div>
      <TransfersList routeData={routeData} />
    </div>
  );
};

export default OfflinePage;
