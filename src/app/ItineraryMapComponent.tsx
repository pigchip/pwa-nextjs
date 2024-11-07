import React, { useState, useEffect, useContext, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SubwayIcon from '@mui/icons-material/Subway';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MapIcon from '@mui/icons-material/Map';
import { Itinerary, ItineraryMapComponentProps, PlanResponse, Leg } from '@/types/map';
import { SelectedItineraryContext } from '@/contexts/SelectedItineraryContext';
import { createEndIcon, createStartIcon, MapView } from '@/utils/map';
import { formatDuration, generateRandomETA, getColorForLeg, getPolylineStyle, saveRouteToLocalStorage, toggleExpand } from '@/utils/itineraryUtils';
import { ITINERARY_QUERY } from '@/queries/queries';

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
    console.log('Received startLocation from AutoComplete:', startLocation);
    console.log('Received endLocation from AutoComplete:');
    
    if (endLocation) {
      Object.entries(endLocation).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
    }

    if (startLocation) {
      setFromLat(startLocation.lat.toString());
      setFromLon(startLocation.lon.toString());
      if (startLocation.display_name) {
        setStartName(startLocation.display_name);
      } else {
        console.error("startLocation.display_name no está definido");
      }
    } else if (userLocation) {
      setFromLat(userLocation.lat.toString());
      setFromLon(userLocation.lon.toString());
      setStartName("Mi Ubicación");
    }

    if (endLocation) {
      setToLat(endLocation.lat.toString());
      setToLon(endLocation.lon.toString());
      if (endLocation.display_name) {
        setEndName(endLocation.display_name);
      } else {
        console.error("endLocation.display_name no está definido");
      }
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

  const fetchFastestItinerary = useCallback(async (maxTransfers: number): Promise<Itinerary | null> => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const query = ITINERARY_QUERY(Number(fromLat), Number(fromLon), Number(toLat), Number(toLon), currentDate, currentTime, maxTransfers);

    try {
      const otpUrl = process.env.NEXT_PUBLIC_OTP_API_BASE_URL;

      const response = await fetch(`${otpUrl}otp/routers/default/index/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: PlanResponse = await response.json();
      console.log("API response data:", data);

      if (data.errors || !data.data?.plan?.itineraries) {
        console.error('Invalid data or errors:', data.errors);
        return null;
      }

      return data.data.plan.itineraries.reduce((prev, current) =>
        prev.duration < current.duration ? prev : current
      );
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      return null;
    }
  }, [fromLat, fromLon, toLat, toLon]);

  const fetchAllItineraries = useCallback(async () => {
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return;
    }

    setLoading(true);
    setIsExpanded(true);

    const [walkItinerary, oneTransferItinerary, twoTransferItinerary] = await Promise.all([
      fetchFastestItinerary(0),
      fetchFastestItinerary(1),
      fetchFastestItinerary(2),
    ]);

    const sortedItineraries = [walkItinerary, oneTransferItinerary, twoTransferItinerary]
      .filter(Boolean)
      .sort((a, b) => (a && b ? a.duration - b.duration : 0));

    setItineraryData(sortedItineraries as Itinerary[]);
    setLoading(false);
  }, [fromLat, fromLon, toLat, toLon, fetchFastestItinerary, setLoading, setIsExpanded, setItineraryData]);

  useEffect(() => {
    if (fromLat && fromLon && toLat && toLon) {
      fetchAllItineraries();
    }
  }, [fromLat, fromLon, toLat, toLon, fetchAllItineraries]);

  const handlePlotItinerary = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
    console.log("Itinerario seleccionado para trazar:", itinerary);
    setIsExpanded(false);
    setExpandedLegIndex(null);
  };

  const handleExpandDetails = (index: number) => {
    setExpandedLegIndex(index === expandedLegIndex ? null : index);
    setCurrentLegIndex(0);
    setIsExpanded(true);
  };

  return (
    <div className="flex flex-col h-full">
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
  
          {selectedItinerary && selectedItinerary.legs.map((leg: Leg, legIndex: React.Key | null | undefined) => {
            console.log("Leg geometry:", leg.legGeometry);
            if (leg.legGeometry?.points) {
              const decodedPolyline = polyline.decode(leg.legGeometry.points);
              return (
                <Polyline
                  key={legIndex}
                  positions={decodedPolyline.map(coord => [coord[0], coord[1]])}
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
  
          <MapView startLocation={startLocation} endLocation={endLocation} userLocation={userLocation} />
        </MapContainer>
      </div>
  
      <div className={`overflow-y-auto bg-white transition-all duration-300 ease-in-out rounded-t-lg shadow-lg flex-none ${isExpanded ? 'h-[454px]' : 'h-[180px]'}`}>
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
                                    title={`ETA: ${generateRandomETA()}`}
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
                            {selectedItinerary.legs.map((leg: Leg, legIndex: React.Key | null | undefined) => {
                              const color = getColorForLeg(leg);
                              const Icon = getTransportIcon(leg.mode);
                              return (
                                <React.Fragment key={legIndex}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      marginRight: (legIndex as number) < selectedItinerary.legs.length - 1 ? '12px' : '0',
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
                                  {typeof legIndex === 'number' && legIndex < selectedItinerary.legs.length - 1 && (
                                    <ArrowForwardIcon style={{ color: 'gray' }} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
  
                          {/* Botones de detalles y mapear ruta guardada */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <AccessTimeIcon className="text-gray-500 mr-1" fontSize="small" />
                              <p className="text-sm font-bold">
                                {formatDuration(selectedItinerary.duration)}
                              </p>
                            </div>
                            {/* Botón "Guardar Ruta" */}
                            <button
                              className="bg-purple-500 text-white p-2 rounded w-full sm:w-auto flex items-center justify-center"
                              onClick={() => saveRouteToLocalStorage(
                                selectedItinerary,
                                startName,
                                endName
                              )}
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
}

export default ItineraryMapComponent;