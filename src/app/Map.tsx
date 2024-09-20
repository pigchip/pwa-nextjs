import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Room } from '@mui/icons-material'; // Importamos el ícono de ubicación de Material Icons
import { renderToStaticMarkup } from 'react-dom/server';
import { useEffect } from 'react';

// Función para crear un ícono con estilo circular para el inicio
const createStartIcon = () => {
  const iconHTML = `
    <div style="
      position: relative;
      width: 50px; /* Tamaño del contenedor ajustado al círculo exterior */
      height: 50px;
    ">
      <!-- Círculo interior -->
      <div style="
        background-color: #00bcd4;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 5px solid white;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2; /* Asegura que el círculo interior esté sobre el exterior */
      "></div>
      
      <!-- Círculo exterior -->
      <div style="
        background-color: rgba(0, 188, 212, 0.2);
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid #00bcd4;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1; /* Círculo exterior en el fondo */
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHTML,
    className: '',
    iconSize: [50, 50], // Tamaño del contenedor total (círculo exterior)
    iconAnchor: [25, 25], // Centra el icono en su ancla
    popupAnchor: [0, -25], // Ajusta el popup para que aparezca encima del icono
  });
};

const createEndIcon = () => {
  const iconHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 30px;
      height: 50px;
    ">
      <!-- Ícono de marcador -->
      <div style="
        background-color: red;
        width: 20px;
        height: 30px;
        clip-path: polygon(50% 0%, 100% 75%, 50% 100%, 0% 75%);
        position: relative;
        z-index: 2;
      "></div>

      <!-- Círculo transparente en la punta -->
      <div style="
        background-color: rgba(255, 0, 0, 0.2); /* Rojo claro con opacidad */
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 2px solid red;
        position: absolute;
        bottom: -10px; /* Lo posiciona justo debajo del marcador */
        z-index: 1;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHTML,
    className: '',
    iconSize: [30, 50], // Tamaño total del icono
    iconAnchor: [15, 50], // Ajusta el ancla para que la punta del marcador esté en su posición
    popupAnchor: [0, -50], // Ajusta el popup para que aparezca encima del marcador
  });
};

interface MapProps {
  startLocation: { lat: number, lon: number } | null;
  endLocation: { lat: number, lon: number } | null;
}

// Componente que maneja la lógica del centrado y zoom
function MapView({ startLocation, endLocation }: MapProps) {
  const map = useMap(); // Obtenemos la instancia del mapa usando el hook useMap

  useEffect(() => {
    if (!map) return;

    if (startLocation && !endLocation) {
      map.setView([startLocation.lat, startLocation.lon], 14); // Centramos en la ubicación inicial
    } else if (endLocation && !startLocation) {
      map.setView([endLocation.lat, endLocation.lon], 14); // Centramos en la ubicación de destino
    } else if (startLocation && endLocation) {
      const bounds = L.latLngBounds([
        [startLocation.lat, startLocation.lon],
        [endLocation.lat, endLocation.lon],
      ]);

      // Ajustamos el zoom y desplazamos hacia abajo añadiendo padding
      map.fitBounds(bounds.pad(0.1), {
        paddingTopLeft: [0, 100], // Desplazamos hacia abajo (ajusta este valor según tus necesidades)
        maxZoom: 14, // Ajusta el máximo zoom si es necesario
      });
    } else {
      map.setView([19.432608, -99.133209], 13); // Ubicación predeterminada (CDMX)
    }
  }, [map, startLocation, endLocation]);

  return null; // No renderiza ningún elemento visual
}

export default function Map({ startLocation, endLocation }: MapProps) {
  const defaultPosition: L.LatLngExpression = [19.432608, -99.133209]; // Coordenadas iniciales (CDMX)
  const startIcon = createStartIcon(); // Ícono para el inicio
  const endIcon = createEndIcon(); // Ícono para el destino
  
  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Renderizamos el marcador del inicio si la ubicación es válida */}
      {startLocation && (
        <Marker position={[startLocation.lat, startLocation.lon] as L.LatLngExpression} icon={startIcon}>
          <Popup>Inicio</Popup>
        </Marker>
      )}
      {/* Renderizamos el marcador del destino si la ubicación es válida */}
      {endLocation && (
        <Marker position={[endLocation.lat, endLocation.lon] as L.LatLngExpression} icon={endIcon}>
          <Popup>Destino</Popup>
        </Marker>
      )}
      
      {/* Componente que maneja el centrado y zoom */}
      <MapView startLocation={startLocation} endLocation={endLocation} />
    </MapContainer>
  );
}
