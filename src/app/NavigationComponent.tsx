import React, { useState } from 'react';
import dynamic from 'next/dynamic'; // Usamos dynamic para evitar el error de 'window' en Next.js
import AutoComplete from './AutoComplete'; // Componente de autocompletado (opcional)
import MapComponent from './MapComponent';
import 'leaflet/dist/leaflet.css'; // Importa los estilos aquí
import './globals.css'; // Si tienes estilos globales
import AccountDetailsComponent from './AccountDetailsComponent';

const Map = dynamic(() => import('./Map'), { ssr: false }); // El mapa solo se renderiza en el lado del cliente

const NavigationComponent: React.FC = () => {
  const [startLocation, setStartLocation] = React.useState<{ lat: number, lon: number } | null>(null);
  const [endLocation, setEndLocation] = React.useState<{ lat: number, lon: number } | null>(null);
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false);
  
  // Función para abrir el modal
  const handleAccountDetailsClick = () => {
    setShowAccountDetailsModal(true);
  };

  // Función para cerrar el modal desde el componente hijo
  const handleCloseModalProfile = () => {
    setShowAccountDetailsModal(false);
  };

  return (
    <div className="relative flex flex-col h-full bg-gray-100">
      {/* Contenido superior con avatar y título */}
      <div className="flex flex-col items-start space-y-6 w-full pl-4 mt-4 mb-4"> {/* Añadido mb-4 */}
        <div className="flex flex-col items-start space-y-2 w-full">
          <span
            className="material-icons text-[#6ABDA6] cursor-pointer"
            onClick={handleAccountDetailsClick}
          >
            account_circle
          </span>
        </div>
      </div>

      {/* Sección del mapa */}
      <div className="relative flex-grow">
        {/* Autocompletar Inicio - Posicionamos encima del mapa con transparencia y menor ancho */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
          <AutoComplete placeholder="Mi Ubicación" onSelect={setStartLocation} />
        </div>

        {/* Autocompletar Destino - Posicionamos encima del mapa con transparencia y menor ancho */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-opacity-50 shadow-md rounded-md backdrop-blur-sm max-w-64 w-full">
          <AutoComplete placeholder="Destino" onSelect={setEndLocation} />
        </div>

        {/* Componente del Mapa */}
        <MapComponent startLocation={startLocation} endLocation={endLocation} />
      </div>

      {/* Modal para mostrar detalles de la cuenta */}
      {showAccountDetailsModal && (
        <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg z-50 max-w-sm w-full">
            <AccountDetailsComponent onClose={handleCloseModalProfile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationComponent;
