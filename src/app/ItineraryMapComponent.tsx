import React, { useState, useEffect, useContext, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MapIcon from '@mui/icons-material/Map';
import { Itinerary, ItineraryMapComponentProps, Leg } from '@/types/map';
import { SelectedItineraryContext } from '@/contexts/SelectedItineraryContext';
import { createEndIcon, createStartIcon, MapView } from '@/utils/map';
import { formatDuration, formatTimeWithAmPm, generateRandomETA, getColorForLeg, getPolylineStyle, saveRouteToLocalStorage, toggleExpand } from '@/utils/itineraryUtils';
import {
  ITINERARY_QUERY,
  ITINERARY_QUERY_WALK_ONLY,
  ITINERARY_QUERY_BUS_WALK,
  ITINERARY_QUERY_SUBWAY_WALK,
  ITINERARY_QUERY_TRAM_WALK,
  ITINERARY_QUERY_RAIL_WALK,
  ITINERARY_QUERY_FERRY_WALK,
  ITINERARY_QUERY_GONDOLA_WALK,
  ITINERARY_QUERY_CABLE_CAR_WALK,
  ITINERARY_QUERY_FUNICULAR_WALK,
  ITINERARY_QUERY_BUS_SUBWAY_WALK,
  ITINERARY_QUERY_SUBWAY_TRAM_WALK,
  ITINERARY_QUERY_ALL_MODES_WALK
} from '@/queries/queries';
import { fetchItineraries } from '@/utils/fetchItineraries';
import { getTransportIcon } from '@/utils/getTransportIcon';

const ItineraryMapComponent: React.FC<ItineraryMapComponentProps> = ({
  startLocation,
  endLocation,
}) => {
  const { selectedItinerary, setSelectedItinerary } = useContext(SelectedItineraryContext);

  const defaultPosition: L.LatLngExpression = [19.432608, -99.133209];
  const startIcon = createStartIcon();
  const endIcon = createEndIcon();

  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [itineraryData, setItineraryData] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [expandedLegIndex, setExpandedLegIndex] = useState<number | null>(null);
  const [currentLegIndex, setCurrentLegIndex] = useState<number>(0);

  const [fromLat, setFromLat] = useState<string>(startLocation ? startLocation.lat.toString() : '');
  const [fromLon, setFromLon] = useState<string>(startLocation ? startLocation.lon.toString() : '');
  const [toLat, setToLat] = useState<string>(endLocation ? endLocation.lat.toString() : '');
  const [toLon, setToLon] = useState<string>(endLocation ? endLocation.lon.toString() : '');

  const [startName, setStartName] = useState<string>(startLocation?.name || '');
  const [endName, setEndName] = useState<string>(endLocation?.name || '');

  // State for custom marker
  const [customMarker, setCustomMarker] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    // Update start and end locations
    if (startLocation) {
      setFromLat(startLocation.lat.toString());
      setFromLon(startLocation.lon.toString());
      setStartName(startLocation.display_name || startLocation.name || 'Inicio');
    } else if (userLocation && !startLocation) {
      setFromLat(userLocation.lat.toString());
      setFromLon(userLocation.lon.toString());
      setStartName('Mi Ubicación');
    }

    if (endLocation) {
      setToLat(endLocation.lat.toString());
      setToLon(endLocation.lon.toString());
      setEndName(endLocation.display_name || endLocation.name || 'Destino');
    }
  }, [startLocation, endLocation, userLocation]);

  useEffect(() => {
    if (!startLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude, name: 'Current Location' });
        },
        (error) => {
          console.error('Error al obtener la ubicación', error);
          alert(`Error (${error.code}): ${error.message}`);
          setUserLocation({ lat: 19.432608, lon: -99.133209, name: 'Default Location' });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, [startLocation]);

  function generateSimplifiedItineraryKey(itinerary: Itinerary): string {
    // Clave simplificada basada en el modo de transporte y las ubicaciones de origen y destino
    return `${itinerary.legs.map((leg) => `${leg.mode}-${leg.from.name}-${leg.to.name}`).join('|')}`;
  }
  
  function removeDuplicateItineraries(itineraries: Itinerary[]) {
    const seen = new Set();
    return itineraries.filter(itinerary => {
      const key = generateSimplifiedItineraryKey(itinerary);
      if (seen.has(key)) {
        return false; // Itinerario repetido
      } else {
        seen.add(key);
        return true; // Itinerario único
      }
    });
  }
  

  const fetchAllItineraries = useCallback(async () => {
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return;
    }
  
    setLoading(true);
    setIsExpanded(true);
  
    const currentDate = new Date().toLocaleDateString('en-US'); // Formato ISO (YYYY-MM-DD)
    console.log('Current Local Date:', currentDate);
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: true });
    console.log('Current Local Time:', currentTime);    
       
  
    const maxTransfers = 10; // Increase to allow more transfers
    const numItineraries = 30; // Fetch more itineraries
  
    try {
      // Fetch itineraries for different transport modes
      const queries = [
        ITINERARY_QUERY(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_WALK_ONLY(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_BUS_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_SUBWAY_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_TRAM_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_RAIL_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_FERRY_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_GONDOLA_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_CABLE_CAR_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_FUNICULAR_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_BUS_SUBWAY_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_SUBWAY_TRAM_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
        ITINERARY_QUERY_ALL_MODES_WALK(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers, numItineraries),
      ];
  
      // Execute all queries and collect responses
      const results = await Promise.all(queries.map((query) => fetchItineraries(query)));
  
      // Combine all itineraries
      let allItineraries = results.flat();
  
      // Filtrar itinerarios únicos
      const uniqueItineraries = removeDuplicateItineraries(allItineraries);
  
      // Sort itineraries by duration (fastest to longest)
      const sortedItineraries = uniqueItineraries.sort((a, b) => a.duration - b.duration);
  
      setItineraryData(sortedItineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    } finally {
      setLoading(false);
    }
  }, [fromLat, fromLon, toLat, toLon, setLoading, setIsExpanded, setItineraryData]);

  useEffect(() => {
    if (fromLat && fromLon && toLat && toLon) {
      fetchAllItineraries();
    }
  }, [fromLat, fromLon, toLat, toLon, fetchAllItineraries]);

  const handlePlotItinerary = (itinerary: Itinerary) => {
    if (!itinerary) {
      setSelectedItinerary(itinerary);
    } else {
      itinerary.startNameIti = startName;
      itinerary.endNameIti = endName;

      setSelectedItinerary(itinerary);
    }
    console.log('Itinerario seleccionado para trazar:', itinerary);
    setTimeout(() => {
      setIsExpanded(false);
    }, 50); // Adjust the timing as necessary
    setExpandedLegIndex(null);
  };

  const handleExpandDetails = (index: number) => {
    setExpandedLegIndex(index === expandedLegIndex ? null : index);
    setCurrentLegIndex(0);
    setIsExpanded(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex-grow min-h-[100px] z-10 ${
          isExpanded ? 'h-[145px]' : 'h-[420px]'
        }`}
      >
        <MapContainer
          center={
            startLocation
              ? [startLocation.lat, startLocation.lon]
              : userLocation
              ? [userLocation.lat, userLocation.lon]
              : defaultPosition
          }
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

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
          {!startLocation && userLocation && (
            <Marker position={[userLocation.lat, userLocation.lon]} icon={startIcon}>
              <Popup>Ubicación actual</Popup>
            </Marker>
          )}

          {selectedItinerary &&
            selectedItinerary.legs.map((leg: Leg, legIndex: React.Key | null | undefined) => {
              if (leg.legGeometry?.points) {
                const decodedPolyline = polyline.decode(leg.legGeometry.points);
                return (
                  <Polyline
                    key={legIndex}
                    positions={decodedPolyline.map((coord) => [coord[0], coord[1]])}
                    pathOptions={getPolylineStyle(leg)}
                  />
                );
              }
              return null;
            })}

          {/* Custom Marker */}
          {customMarker && (
            <Marker position={[customMarker.lat, customMarker.lon]}>
              <Popup>Custom Marker</Popup>
            </Marker>
          )}

          <MapView
            startLocation={startLocation}
            endLocation={endLocation}
            userLocation={userLocation}
          />
        </MapContainer>
      </div>

      <div
        className={`overflow-y-auto bg-white transition-all duration-300 ease-in-out rounded-t-lg shadow-lg flex-none ${
          isExpanded ? 'h-[454px]' : 'h-[180px]'
        }`}
      >
        <div
          className="flex justify-center items-center cursor-pointer bg-gray-200"
          onClick={() => toggleExpand(isExpanded, setIsExpanded)}
        >
          {isExpanded ? (
            <ExpandLessIcon className="text-gray-500" />
          ) : (
            <ExpandMoreIcon className="text-gray-500" />
          )}
        </div>
        <div className="p-4 flex flex-col">
          {/* Menu Content */}
          {loading ? (
            <p className="text-center">Cargando itinerarios...</p>
          ) : (
            itineraryData.length > 0 && (
              <div className="space-y-4 overflow-y-auto">
                {/* If the menu is expanded, show all itineraries */}
                {isExpanded
                  ? itineraryData.map((itinerary, index) => (
                      <div key={index} className="bg-green-100 p-3 rounded-lg max-w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                          {/* Visualization of legs with icons */}
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
                                      marginRight:
                                        legIndex < itinerary.legs.length - 1 ? '12px' : '0',
                                    }}
                                    title={`ETA: ${generateRandomETA()}`}
                                  >
                                    {/* Duration above the icon */}
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
                                    {/* Distance below the icon */}
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

                          {/* Buttons for details and mapping */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
                          <div className="flex flex-col items-start mb-2 sm:mb-0">
                            {itinerary.waitingTime > 0 && (
                              <p className="text-sm font-medium">
                                Espera: {formatDuration(itinerary.waitingTime)}
                              </p>
                            )}
                            <div className="flex items-center">
                              <AccessTimeIcon
                                className="text-gray-500 mr-1"
                                fontSize="small"
                              />
                              <p className="text-sm font-bold">
                                {formatDuration(itinerary.duration)}
                              </p>
                            </div>
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
                        {/* Show details if expanded */}
                        {expandedLegIndex === index && (
                          <div className="mt-2">
                            {/* Slider controls */}
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
                                {/* Show current leg */}
                                {itinerary.legs[currentLegIndex] && (
                                  <div
                                    className="rounded-lg p-4 text-white"
                                    style={{
                                      backgroundColor: getColorForLeg(
                                        itinerary.legs[currentLegIndex]
                                      ),
                                    }}
                                  >
                                    {/* Leg details */}
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
                                      {Math.round(itinerary.legs[currentLegIndex].distance)}{' '}
                                      metros
                                    </p>
                                    <p>
                                      <strong>Duración:</strong>{' '}
                                      {formatDuration(itinerary.legs[currentLegIndex].duration)}
                                    </p>
                                    <p>
                                      <strong>Hora al empezar:</strong>{' '}
                                      {formatTimeWithAmPm(itinerary.legs[currentLegIndex].startTime)}
                                    </p>
                                    <p>
                                      <strong>Hora al terminar :</strong>{' '}
                                      {formatTimeWithAmPm(itinerary.legs[currentLegIndex].endTime)}
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
                            {/* Pagination indicator */}
                            <div className="flex justify-center mt-2">
                              {itinerary.legs.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-2 w-2 rounded-full mx-1 ${
                                    currentLegIndex === idx
                                      ? 'bg-blue-500'
                                      : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  : // If the menu is collapsed, only show the selected itinerary
                    selectedItinerary && (
                      <div className="bg-green-100 p-3 rounded-lg max-w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                          {/* Visualization of legs with icons */}
                          <div className="flex items-center flex-wrap">
                            {selectedItinerary.legs.map(
                              (leg: Leg, legIndex: React.Key | null | undefined) => {
                                const color = getColorForLeg(leg);
                                const Icon = getTransportIcon(leg.mode);
                                return (
                                  <React.Fragment key={legIndex}>
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        marginRight:
                                          (legIndex as number) <
                                          selectedItinerary.legs.length - 1
                                            ? '12px'
                                            : '0',
                                      }}
                                      title={`ETA: ${generateRandomETA()}`}
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
                                    {typeof legIndex === 'number' &&
                                      legIndex < selectedItinerary.legs.length - 1 && (
                                        <ArrowForwardIcon style={{ color: 'gray' }} />
                                      )}
                                  </React.Fragment>
                                );
                              }
                            )}
                          </div>

                          {/* Buttons for saving the route */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
                          <div className="flex flex-col items-start mb-2 sm:mb-0">
                            {selectedItinerary.waitingTime > 0 && (
                              <p className="text-sm font-medium">
                                Espera: {formatDuration(selectedItinerary.waitingTime)}
                              </p>
                            )}
                            <div className="flex items-center">
                              <AccessTimeIcon
                                className="text-gray-500 mr-1"
                                fontSize="small"
                              />
                              <p className="text-sm font-bold">
                                {formatDuration(selectedItinerary.duration)}
                              </p>
                            </div>
                          </div>
                            {/* "Save Route" Button */}
                            <button
                              className="bg-purple-500 text-white p-2 rounded w-full sm:w-auto flex items-center justify-center"
                              onClick={() =>
                                saveRouteToLocalStorage(
                                  selectedItinerary,
                                  startName,
                                  endName
                                )
                              }
                            >
                              Guardar Ruta
                            </button>
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
