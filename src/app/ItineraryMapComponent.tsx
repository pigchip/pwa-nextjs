// src/app/ItineraryMapComponent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L, { PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import './globals.css';

// Importando íconos de Material-UI
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SubwayIcon from '@mui/icons-material/Subway';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Interfaces para los datos
interface Place {
  name: string;
  lat: number;
  lon: number;
}

interface LegGeometry {
  points: string;
}

interface Route {
  shortName: string;
  color?: string;
  agency?: {
    id: string;
    name: string;
    url: string;
  };
}

interface Leg {
  mode: string;
  startTime: number;
  endTime: number;
  from: Place;
  to: Place;
  distance: number;
  duration: number;
  legGeometry?: LegGeometry;
  route?: Route;
}

interface Itinerary {
  startTime: number;
  endTime: number;
  duration: number;
  numberOfTransfers: number;
  walkTime: number;
  walkDistance: number;
  legs: Leg[];
}

interface PlanResponse {
  data?: {
    plan?: {
      itineraries: Itinerary[];
      messageStrings: string[];
    };
  };
  errors?: any;
}

interface ItineraryMapComponentProps {
  startLocation: { lat: number; lon: number } | null;
  endLocation: { lat: number; lon: number } | null;
}

// Funciones para crear íconos personalizados
const createStartIcon = () => {
  const iconHTML = `
    <div style="
      position: relative;
      width: 50px;
      height: 50px;
    ">
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
        z-index: 2;
      "></div>
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
        z-index: 1;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHTML,
    className: '',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
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
      <div style="
        background-color: red;
        width: 20px;
        height: 30px;
        clip-path: polygon(50% 0%, 100% 75%, 50% 100%, 0% 75%);
        position: relative;
        z-index: 2;
      "></div>
      <div style="
        background-color: rgba(255, 0, 0, 0.2);
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 2px solid red;
        position: absolute;
        bottom: -10px;
        z-index: 1;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHTML,
    className: '',
    iconSize: [30, 50],
    iconAnchor: [15, 50],
    popupAnchor: [0, -50],
  });
};

// Componente que maneja el centrado y zoom del mapa
function MapView({
  startLocation,
  endLocation,
}: {
  startLocation: { lat: number; lon: number } | null;
  endLocation: { lat: number; lon: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (startLocation && !endLocation) {
      map.setView([startLocation.lat, startLocation.lon], 14);
    } else if (endLocation && !startLocation) {
      map.setView([endLocation.lat, endLocation.lon], 14);
    } else if (startLocation && endLocation) {
      const bounds = L.latLngBounds([
        [startLocation.lat, startLocation.lon],
        [endLocation.lat, endLocation.lon],
      ]);

      map.fitBounds(bounds.pad(0.1), {
        paddingTopLeft: [0, 100],
        maxZoom: 14,
      });
    } else {
      map.setView([19.432608, -99.133209], 13); // Ubicación predeterminada (CDMX)
    }
  }, [map, startLocation, endLocation]);

  return null;
}

const ItineraryMapComponent: React.FC<ItineraryMapComponentProps> = ({
  startLocation,
  endLocation,
}) => {
  const defaultPosition: L.LatLngExpression = [19.432608, -99.133209];
  const startIcon = createStartIcon();
  const endIcon = createEndIcon();

  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [itineraryData, setItineraryData] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [expandedLegIndex, setExpandedLegIndex] = useState<number | null>(null);
  const [currentLegIndex, setCurrentLegIndex] = useState<number>(0);

  const [fromLat, setFromLat] = useState<string>(startLocation ? startLocation.lat.toString() : '');
  const [fromLon, setFromLon] = useState<string>(startLocation ? startLocation.lon.toString() : '');
  const [toLat, setToLat] = useState<string>(endLocation ? endLocation.lat.toString() : '');
  const [toLon, setToLon] = useState<string>(endLocation ? endLocation.lon.toString() : '');

  // Actualizar coordenadas cuando cambian las props o la ubicación del usuario
  useEffect(() => {
    if (startLocation) {
      setFromLat(startLocation.lat.toString());
      setFromLon(startLocation.lon.toString());
    } else if (userLocation) {
      setFromLat(userLocation.lat.toString());
      setFromLon(userLocation.lon.toString());
    }

    if (endLocation) {
      setToLat(endLocation.lat.toString());
      setToLon(endLocation.lon.toString());
    }
  }, [startLocation, endLocation, userLocation]);

  // Obtener ubicación del usuario si no hay startLocation
  useEffect(() => {
    if (!startLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error('Error al obtener la ubicación', error);
          alert(`Error (${error.code}): ${error.message}`);
          setUserLocation({ lat: 19.432608, lon: -99.133209 }); // Ubicación predeterminada si falla
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, [startLocation]);

  // Función para formatear la duración en segundos a "Xh Ymin"
  const formatDuration = (durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  // Función para obtener el ícono de transporte basado en el modo
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'WALK':
        return <DirectionsWalkIcon className="text-white" />;
      case 'BUS':
        return <DirectionsBusIcon className="text-white" />;
      case 'SUBWAY':
        return <SubwayIcon className="text-white" />;
      case 'RAIL':
        return <TrainIcon className="text-white" />;
      case 'FERRY':
        return <DirectionsBoatIcon className="text-white" />;
      default:
        return <DirectionsWalkIcon className="text-white" />;
    }
  };

  // Función para obtener el color del tramo
  const getColorForLeg = (leg: Leg) => {
    return leg.route?.color ? `#${leg.route.color}` : leg.mode === 'WALK' ? '#00BFFF' : 'gray';
  };

  // Función para obtener el estilo de la polilínea
  const getPolylineStyle = (leg: Leg): PathOptions => {
    if (leg.mode === 'WALK') {
      return {
        color: '#00BFFF', // Azul claro para caminar
        weight: 5,
        dashArray: '5, 10',
      };
    }

    let color = 'gray';

    if (leg.route && leg.route.color) {
      color = `#${leg.route.color}`;
    }

    return {
      color,
      weight: 5,
    };
  };

  // Función para obtener el itinerario más rápido
  const fetchFastestItinerary = async (maxTransfers: number): Promise<Itinerary | null> => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const query = `
      query {
        plan(
          from: { lat: ${fromLat}, lon: ${fromLon} }
          to: { lat: ${toLat}, lon: ${toLon} }
          date: "${currentDate}"
          time: "${currentTime}"
          numItineraries: 10
          maxTransfers: ${maxTransfers}
          transportModes: [
            { mode: TRANSIT },
            { mode: WALK },
            { mode: BUS },
            { mode: SUBWAY },
            { mode: TRAM },
            { mode: RAIL },
            { mode: FERRY },
            { mode: GONDOLA },
            { mode: CABLE_CAR },
            { mode: FUNICULAR }
          ]
        ) {
          itineraries {
            startTime
            endTime
            duration
            numberOfTransfers
            walkTime
            walkDistance
            legs {
              mode
              startTime
              endTime
              from {
                name
                lat
                lon
              }
              to {
                name
                lat
                lon
              }
              distance
              duration
              legGeometry {
                points
              }
              route {
                shortName
                color
                agency {
                  id
                  name
                  url
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch('http://localhost:8080/otp/routers/default/index/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: PlanResponse = await response.json();

      if (data.errors || !data.data?.plan?.itineraries) {
        console.error('Invalid data or errors:', data.errors);
        return null;
      }

      // Seleccionar el itinerario con la menor duración
      return data.data.plan.itineraries.reduce((prev, current) =>
        prev.duration < current.duration ? prev : current
      );
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      return null;
    }
  };

  // Función para obtener todos los itinerarios necesarios
  const fetchAllItineraries = async () => {
    if (!fromLat || !fromLon || !toLat || !toLon) {
      // No realizar fetch si faltan coordenadas
      return;
    }

    setLoading(true);
    setIsExpanded(true);

    // Obtener itinerarios con diferentes opciones de transbordos
    const [walkItinerary, oneTransferItinerary, twoTransferItinerary] = await Promise.all([
      fetchFastestItinerary(0), // Solo caminar
      fetchFastestItinerary(1), // 1 transbordo
      fetchFastestItinerary(2), // 2 transbordos
    ]);

    // Filtrar itinerarios nulos y ordenar de menor a mayor duración
    const sortedItineraries = [walkItinerary, oneTransferItinerary, twoTransferItinerary]
      .filter(Boolean)
      .sort((a, b) => a.duration - b.duration);

    setItineraryData(sortedItineraries as Itinerary[]);
    setLoading(false);
  };

  // Obtener itinerarios automáticamente cuando cambian las coordenadas
  useEffect(() => {
    if (fromLat && fromLon && toLat && toLon) {
      fetchAllItineraries();
    }
  }, [fromLat, fromLon, toLat, toLon]);

  // Función para trazar un itinerario seleccionado
  const handlePlotItinerary = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
    setIsExpanded(false); // Contraer el menú
    setExpandedLegIndex(null); // Deseleccionar cualquier itinerario previamente expandido
  };

  // Función para expandir o contraer detalles de un itinerario
  const handleExpandDetails = (index: number) => {
    setExpandedLegIndex(index === expandedLegIndex ? null : index);
    setCurrentLegIndex(0); // Reiniciar el índice de la diapositiva al expandir detalles
    setIsExpanded(true); // Asegúrate de que el menú esté expandido
  };

  // Función para alternar la expansión del menú
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Contenedor del mapa con una altura fija */}
      <div className={`flex-grow min-h-[100px] z-10 ${isExpanded ? 'h-[145px]' : 'h-[420px]'}`}>
        <MapContainer
          center={
            startLocation
              ? [startLocation.lat, startLocation.lon]
              : userLocation
              ? [userLocation.lat, userLocation.lon]
              : defaultPosition
          }
          zoom={13}
          style={{ height: '100%', width: '100%' }} // Asegura que el mapa ocupe todo el contenedor
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Marcadores de inicio y fin */}
          {startLocation && (
            <Marker position={[startLocation.lat, startLocation.lon]} icon={startIcon}>
              <Popup>Inicio</Popup>
            </Marker>
          )}
          {endLocation && (
            <Marker position={[endLocation.lat, endLocation.lon]} icon={endIcon}>
              <Popup>Destino</Popup>
            </Marker>
          )}

          {/* Marcador de ubicación del usuario si no hay startLocation */}
          {!startLocation && userLocation && (
            <Marker position={[userLocation.lat, userLocation.lon]} icon={startIcon}>
              <Popup>Ubicación actual</Popup>
            </Marker>
          )}

          {/* Itinerarios trazados */}
          {selectedItinerary && selectedItinerary.legs.map((leg, legIndex) => {
            if (leg.legGeometry && leg.legGeometry.points) {
              const decodedPoints = polyline.decode(leg.legGeometry.points);
              const style = getPolylineStyle(leg);
              return (
                <Polyline key={legIndex} positions={decodedPoints} pathOptions={style} />
              );
            }
            return null;
          })}

          {/* Componente que maneja el centrado y zoom */}
          <MapView startLocation={startLocation || userLocation} endLocation={endLocation} />
        </MapContainer>
      </div>
      
      {/* Contenedor del menú expandible */}
      <div className={`overflow-y-auto bg-white transition-all duration-300 ease-in-out rounded-t-lg shadow-lg flex-none ${isExpanded ? 'h-[454px]' : 'h-[180px]'}`}>
        {/* Botón para expandir/contraer */}
        <div
          className="flex justify-center items-center cursor-pointer bg-gray-200"
          onClick={toggleExpand}
        >
          {isExpanded ? (
            <ExpandLessIcon className="text-gray-500" />
          ) : (
            <ExpandMoreIcon className="text-gray-500" />
          )}
        </div>
        <div className="p-4 flex flex-col">
          {/* Contenido del menú */}
          {loading ? (
            <p className="text-center">Cargando itinerarios...</p>
          ) : (
            itineraryData.length > 0 && (
              <div className="space-y-4 overflow-y-auto">
                {/* Si el menú está expandido, mostrar todos los itinerarios */}
                {isExpanded
                  ? itineraryData.map((itinerary, index) => (
                      <div key={index} className="bg-green-100 p-3 rounded-lg max-w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                          {/* Visualización de los tramos con íconos */}
                          <div className="flex items-center flex-wrap">
                            {itinerary.legs.map((leg, legIndex) => {
                              const color = getColorForLeg(leg);
                              const Icon = getTransportIcon(leg.mode);
                              return (
                                <React.Fragment key={legIndex}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      marginRight: legIndex < itinerary.legs.length - 1 ? '12px' : '0',
                                    }}
                                  >
                                    {/* Duración arriba del ícono */}
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        marginBottom: '6px',
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {formatDuration(leg.duration)}
                                    </span>

                                    <div
                                      style={{
                                        backgroundColor: color,
                                        borderRadius: '50%',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '50px',
                                        height: '50px',
                                      }}
                                    >
                                      {Icon}
                                    </div>
                                    {/* Distancia debajo del ícono */}
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        marginTop: '6px',
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {Math.round(leg.distance)}m
                                    </span>
                                  </div>
                                  {legIndex < itinerary.legs.length - 1 && (
                                    <ArrowForwardIcon style={{ color: 'gray' }} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* Botones de detalles y mapear */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <AccessTimeIcon className="text-gray-500 mr-1" fontSize="small" />
                              <p className="text-sm font-bold">
                                {formatDuration(itinerary.duration)}
                              </p>
                            </div>

                            <button
                              className="bg-blue-500 text-white p-2 rounded w-full sm:w-auto mb-2 sm:mb-0 flex items-center justify-center"
                              onClick={() => handleExpandDetails(index)}
                            >
                              <InfoOutlinedIcon className="mr-2" />
                              {expandedLegIndex === index ? 'Ocultar Detalles' : 'Ver Detalles'}
                            </button>
                            <button
                              className="bg-green-500 text-white p-2 rounded w-full sm:w-auto flex items-center justify-center"
                              onClick={() => handlePlotItinerary(itinerary)}
                            >
                              <MapIcon className="mr-2" />
                              Mapear
                            </button>
                          </div>
                        </div>
                        {/* Mostrar detalles si está expandido */}
                        {expandedLegIndex === index && (
                          <div className="mt-2">
                            {/* Controles del slider */}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() =>
                                  setCurrentLegIndex(
                                    currentLegIndex > 0
                                      ? currentLegIndex - 1
                                      : itinerary.legs.length - 1
                                  )
                                }
                                className="p-2 bg-gray-300 rounded-full"
                              >
                                Anterior
                              </button>
                              <div className="flex-1 mx-4">
                                {/* Mostrar el tramo actual */}
                                {itinerary.legs[currentLegIndex] && (
                                  <div
                                    className="rounded-lg p-4 text-white"
                                    style={{
                                      backgroundColor: getColorForLeg(
                                        itinerary.legs[currentLegIndex]
                                      ),
                                    }}
                                  >
                                    {/* Detalles del tramo */}
                                    {itinerary.legs[currentLegIndex].route?.agency && (
                                      <p>
                                        <strong>Agencia:</strong>{' '}
                                        {itinerary.legs[currentLegIndex].route!.agency!.name}
                                      </p>
                                    )}
                                    <p>
                                      <strong>Desde:</strong>{' '}
                                      {itinerary.legs[currentLegIndex].from.name}
                                    </p>
                                    <p>
                                      <strong>Hasta:</strong>{' '}
                                      {itinerary.legs[currentLegIndex].to.name}
                                    </p>
                                    <p>
                                      <strong>Distancia:</strong>{' '}
                                      {Math.round(itinerary.legs[currentLegIndex].distance)} metros
                                    </p>
                                    <p>
                                      <strong>Duración:</strong>{' '}
                                      {formatDuration(itinerary.legs[currentLegIndex].duration)}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  setCurrentLegIndex(
                                    (currentLegIndex + 1) % itinerary.legs.length
                                  )
                                }
                                className="p-2 bg-gray-300 rounded-full"
                              >
                                Siguiente
                              </button>
                            </div>
                            {/* Indicador de paginación */}
                            <div className="flex justify-center mt-2">
                              {itinerary.legs.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-2 w-2 rounded-full mx-1 ${
                                    currentLegIndex === idx ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  : 
                  // Si el menú está contraído, solo mostrar el itinerario seleccionado
                    selectedItinerary && (
                      <div className="bg-green-100 p-3 rounded-lg max-w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                          {/* Visualización de los tramos con íconos */}
                          <div className="flex items-center flex-wrap">
                            {selectedItinerary.legs.map((leg, legIndex) => {
                              const color = getColorForLeg(leg);
                              const Icon = getTransportIcon(leg.mode);
                              return (
                                <React.Fragment key={legIndex}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      marginRight: legIndex < selectedItinerary.legs.length - 1 ? '12px' : '0',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        marginBottom: '6px',
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {formatDuration(leg.duration)}
                                    </span>

                                    <div
                                      style={{
                                        backgroundColor: color,
                                        borderRadius: '50%',
                                        padding: '8px',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '50px',
                                        height: '50px',
                                      }}
                                    >
                                      {Icon}
                                    </div>
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        marginTop: '6px',
                                        color: 'black',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {Math.round(leg.distance)}m
                                    </span>
                                  </div>
                                  {legIndex < selectedItinerary.legs.length - 1 && (
                                    <ArrowForwardIcon style={{ color: 'gray' }} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* Botones de detalles y mapear */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <AccessTimeIcon className="text-gray-500 mr-1" fontSize="small" />
                              <p className="text-sm font-bold">
                                {formatDuration(selectedItinerary.duration)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryMapComponent;
