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
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Itinerary, ItineraryMapComponentProps, Leg } from '@/types/map';
import { SelectedItineraryContext } from '@/contexts/SelectedItineraryContext';
import { createEndIcon, createStartIcon, MapView } from '@/utils/map';
import {
  formatDistance,
  formatDuration,
  formatTimeWithAmPm,
  generateRandomETA,
  getColorForLeg,
  getPolylineStyle,
  saveRouteToLocalStorage,
  toggleExpand,
} from '@/utils/itineraryUtils';
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
  ITINERARY_QUERY_ALL_MODES_WALK,
} from '@/queries/queries';
import { fetchItineraries } from '@/utils/fetchItineraries';
import { getTransportIcon } from '@/utils/getTransportIcon';
import { Check } from '@mui/icons-material';
import { Agency, fetchGtfsData } from '@/utils/fetchGtfsData';

const ItineraryMapComponent: React.FC<ItineraryMapComponentProps> = ({
  startLocation,
  endLocation,
}) => {
  const { selectedItinerary, setSelectedItinerary } = useContext(SelectedItineraryContext);

  const defaultPosition: L.LatLngExpression = [19.432608, -99.133209];
  const startIcon = createStartIcon();
  const endIcon = createEndIcon();

  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; name: string } | null>(
    null
  );
  const [itineraryData, setItineraryData] = useState<Itinerary[]>([]);
  const [filteredItineraries, setFilteredItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [expandedLegIndex, setExpandedLegIndex] = useState<number | null>(null);
  const [currentLegIndex, setCurrentLegIndex] = useState<number>(0);

  const [fromLat, setFromLat] = useState<string>(startLocation ? startLocation.lat.toString() : '');
  const [fromLon, setFromLon] = useState<string>(startLocation ? startLocation.lon.toString() : '');
  const [toLat, setToLat] = useState<string>(endLocation ? endLocation.lat.toString() : '');
  const [toLon, setToLon] = useState<string>(endLocation ? endLocation.lon.toString() : '');

  const [startName, setStartName] = useState<string>(startLocation?.name || '');
  const [endName, setEndName] = useState<string>(endLocation?.name || '');
  const [routeData, setRouteData] = useState<Agency[] | null>(null);

  // State for custom marker
  const [customMarker, setCustomMarker] = useState<{ lat: number; lon: number } | null>(null);

  // State for agency filtering
  const [agencyList, setAgencyList] = useState([
    { id: 'QWdlbmN5OjE6U1VC', name: 'Ferrocarriles Suburbanos' },
    { id: 'QWdlbmN5OjE6Q0M', name: 'Corredores Concesionados' },
    { id: 'QWdlbmN5OjE6SU5URVJVUkJBTk8', name: 'Tren El Insurgente' },
    { id: 'QWdlbmN5OjE6Q0JC', name: 'Cablebus' },
    { id: 'QWdlbmN5OjE6TUI', name: 'Metrobús' },
    { id: 'QWdlbmN5OjE6TUVUUk8', name: 'Sistema de Transporte Colectivo Metro' },
    { id: 'QWdlbmN5OjE6VEw', name: 'Servicio de Tren Ligero' },
    { id: 'QWdlbmN5OjE6UFVNQUJVUw', name: 'Pumabús' },
    { id: 'QWdlbmN5OjE6VFJPTEU', name: 'Trolebús' },
    { id: 'QWdlbmN5OjE6UlRQ', name: 'Red de Transporte de Pasajeros' },
  ]);

  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);

  // State for route filtering
  const [routeList, setRouteList] = useState<{ id: string; shortName: string; longName: string; agencyName: string }[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  // State for station filtering
  const [stationList, setStationList] = useState<{ id: string; name: string; routeId: string; routeName: string; agencyName: string }[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);


  useEffect(() => {
    const fetchRouteData = async () => {
      const data = await Promise.all([fetchGtfsData()]);
      setRouteData(data[0]);
      return data;
    };
    fetchRouteData();
  }, []);

  console.log('Route Data:', routeData);

  useEffect(() => {
    // Update routeList based on selected agencies
    interface Route {
      id: string;
      shortName: string;
      longName: string;
      agencyName: string;
    }

    let routes: Route[] = [];

    if (selectedAgencies.length > 0) {
      routeData?.forEach((agency) => {
        if (selectedAgencies.includes(agency.id)) {
          agency.routes.forEach((route) => {
            routes.push({
              id: route.id,
              shortName: route.shortName,
              longName: route.longName,
              agencyName: agency.name,
            });
          });
        }
      });
    } else {
      // If no agency is selected, show no routes
      routes = [];
    }

    // Sort routes alphabetically by agencyName and then by route shortName
    routes.sort((a, b) => {
      if (a.agencyName < b.agencyName) return -1;
      if (a.agencyName > b.agencyName) return 1;
      if (a.shortName < b.shortName) return -1;
      if (a.shortName > b.shortName) return 1;
      return 0;
    });

    setRouteList(routes);
  }, [selectedAgencies]);

  useEffect(() => {
    // Update stationList based on selected routes
    interface Station {
      id: string;
      name: string;
      routeId: string;
      routeName: string;
      agencyName: string;
    }

    let stations: Station[] = [];

    if (selectedRoutes.length > 0) {
      routeData?.forEach((agency) => {
        agency.routes.forEach((route) => {
          if (selectedRoutes.includes(route.id) && route.stops) {
            route.stops.forEach((stop) => {
              stations.push({
                id: stop.id,
                name: stop.name,
                routeId: route.id,
                routeName: `${route.shortName} - ${route.longName}`,
                agencyName: agency.name,
              });
            });
          }
        });
      });
    } else {
      // If no route is selected, show no stations
      stations = [];
    }

    // Remove duplicate stations based on station ID
    const uniqueStations = stations.filter(
      (station, index, self) => index === self.findIndex((s) => s.id === station.id)
    );

    // Sort stations alphabetically by agencyName, routeName, then station name
    uniqueStations.sort((a, b) => {
      if (a.agencyName < b.agencyName) return -1;
      if (a.agencyName > b.agencyName) return 1;
      if (a.routeName < b.routeName) return -1;
      if (a.routeName > b.routeName) return 1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    setStationList(uniqueStations);
  }, [selectedRoutes]);

  useEffect(() => {
    let filtered = itineraryData;
  
    // Excluir itinerarios de líneas específicas seleccionadas
    if (selectedRoutes.length > 0) {
      filtered = filtered.filter((itinerary) =>
        itinerary.legs.every(
          (leg) =>
            !(
              leg.route?.id &&
              selectedRoutes.includes(leg.route.id)
            )
        )
      );
    }
  
    // Excluir itinerarios que pasen por estaciones específicas en las líneas correspondientes
    if (selectedStations.length > 0) {
      filtered = filtered.filter((itinerary) =>
        itinerary.legs.every((leg) => {
          const isExcludedStation =
            (leg.from.stop?.id && selectedStations.includes(leg.from.stop.id)) ||
            (leg.to.stop?.id && selectedStations.includes(leg.to.stop.id));
          const isAssociatedRoute =
            leg.route?.id && selectedRoutes.includes(leg.route.id);
  
          // Excluir itinerario solo si la estación está en una línea seleccionada
          return !(isExcludedStation && isAssociatedRoute);
        })
      );
    }
  
    setFilteredItineraries(filtered);
  }, [selectedRoutes, selectedStations, itineraryData]);  

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
    return `${itinerary.legs
      .map((leg) => `${leg.mode}-${leg.from.name}-${leg.to.name}`)
      .join('|')}`;
  }

  function removeDuplicateItineraries(itineraries: Itinerary[]) {
    const seen = new Set();
    return itineraries.filter((itinerary) => {
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
        ITINERARY_QUERY(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_WALK_ONLY(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_BUS_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_SUBWAY_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_TRAM_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_RAIL_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_FERRY_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_GONDOLA_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_CABLE_CAR_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_FUNICULAR_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_BUS_SUBWAY_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_SUBWAY_TRAM_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
        ITINERARY_QUERY_ALL_MODES_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries
        ),
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
  }, [fromLat, fromLon, toLat, toLon]);

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
        className={`flex-grow min-h-[100px] z-10 ${isExpanded ? 'h-[145px]' : 'h-[420px]'}`}
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

        {/* Comboboxes */}
        <div className="p-4 bg-white shadow-md">
          {/* Combobox de agencias */}
          <Autocomplete
            multiple
            options={agencyList}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            onChange={(event, value) => {
              setSelectedAgencies(value.map((agency) => agency.id));
              // Reset selected routes and stations when agencies change
              setSelectedRoutes([]);
              setSelectedStations([]);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<Check fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.name}
              </li>
            )}
            style={{ width: '100%', marginBottom: '16px' }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Excluir por Agencia"
                placeholder="Selecciona agencias"
              />
            )}
          />

          {/* Combobox de rutas */}
          <Autocomplete
            multiple
            options={routeList}
            groupBy={(option) => option.agencyName}
            disableCloseOnSelect
            getOptionLabel={(option) => `${option.shortName} - ${option.longName}`}
            onChange={(event, value) => {
              setSelectedRoutes(value.map((route) => route.id));
              // Reset selected stations when routes change
              setSelectedStations([]);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<Check fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.shortName} - {option.longName}
              </li>
            )}
            style={{ width: '100%', marginBottom: '16px' }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Excluir por Línea/Ruta"
                placeholder="Selecciona rutas"
              />
            )}
          />

          {/* Combobox de estaciones */}
          <Autocomplete
            multiple
            options={stationList}
            groupBy={(option) => `${option.agencyName} - ${option.routeName}`}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            onChange={(event, value) => {
              setSelectedStations(value.map((station) => station.id));
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<Check fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.name}
              </li>
            )}
            style={{ width: '100%' }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Excluir por Estación"
                placeholder="Selecciona estaciones"
              />
            )}
          />
        </div>

        <div className="p-4 flex flex-col">
          {/* Menu Content */}
          {loading ? (
            <p className="text-center">Cargando itinerarios...</p>
          ) : (
            <>
              {filteredItineraries.length > 0 ? (
                <div className="space-y-4 overflow-y-auto">
                  {/* If the menu is expanded, show all itineraries */}
                  {isExpanded
                    ? filteredItineraries.map((itinerary, index) => (
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
                                        {formatDistance(leg.distance)}
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
                                {expandedLegIndex === index
                                  ? 'Ocultar Detalles'
                                  : 'Ver Detalles'}
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
                                      {itinerary.legs[currentLegIndex].route?.longName &&
                                        itinerary.legs[currentLegIndex].route?.shortName && (
                                          <p>
                                            <strong>Línea/Ruta:</strong>{' '}
                                            {itinerary.legs[currentLegIndex].route!.shortName} -{' '}
                                            {itinerary.legs[currentLegIndex].route!.longName}
                                          </p>
                                        )}
                                      <p>
                                        <strong>Desde:</strong>{' '}
                                        {itinerary.legs[currentLegIndex].from.name === 'Origin'
                                          ? startLocation?.display_name
                                          : itinerary.legs[currentLegIndex].from.stop?.name 
                                            ? itinerary.legs[currentLegIndex].from.stop.name
                                            : itinerary.legs[currentLegIndex].from.name}
                                      </p>
                                      <p>
                                        <strong>Hasta:</strong>{' '}
                                        {itinerary.legs[currentLegIndex].to.name === 'Destination'
                                          ? endLocation?.display_name
                                          : itinerary.legs[currentLegIndex].to.stop?.name 
                                            ? itinerary.legs[currentLegIndex].to.stop.name
                                            : itinerary.legs[currentLegIndex].to.name}
                                      </p>
                                      <p>
                                        <strong>Distancia:</strong>{' '}
                                        {formatDistance(itinerary.legs[currentLegIndex].distance)}
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
                                        <strong>Hora al terminar:</strong>{' '}
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
                                      currentLegIndex === idx ? 'bg-blue-500' : 'bg-gray-300'
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
                                  saveRouteToLocalStorage(selectedItinerary, startName, endName)
                                }
                              >
                                Guardar Ruta
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-4">Sin itinerarios</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryMapComponent;
