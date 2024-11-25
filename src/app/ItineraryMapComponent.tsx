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
  generateBannedBlocks,
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
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

  // State para filtrado de agencias
  const [agencyList, setAgencyList] = useState([
    { id: 'QWdlbmN5OjE6U1VC', name: 'Ferrocarriles Suburbanos', gtfsId: "1:SUB" },
    { id: 'QWdlbmN5OjE6Q0M', name: 'Corredores Concesionados', gtfsId: "1:CC" },
    { id: 'QWdlbmN5OjE6SU5URVJVUkJBTk8', name: 'Tren El Insurgente', gtfsId: "1:INTERURBANO" },
    { id: 'QWdlbmN5OjE6Q0JC', name: 'Cablebus', gtfsId: "1:CBB" },
    { id: 'QWdlbmN5OjE6TUI', name: 'Metrobús', gtfsId: "1:MB" },
    { id: 'QWdlbmN5OjE6TUVUUk8', name: 'Sistema de Transporte Colectivo Metro', gtfsId: "1:METRO" },
    { id: 'QWdlbmN5OjE6VEw', name: 'Servicio de Tren Ligero', gtfsId: "1:TL" },
    { id: 'QWdlbmN5OjE6UFVNQUJVUw', name: 'Pumabús', gtfsId: "1:PUMABUS" },
    { id: 'QWdlbmN5OjE6VFJPTEU', name: 'Trolebús', gtfsId: "1:TROLE" },
    { id: 'QWdlbmN5OjE6UlRQ', name: 'Red de Transporte de Pasajeros', gtfsId: "1:RTP" },
  ]);

  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]); // Almacena gtfsId

  // State para filtrado de rutas
  const [routeList, setRouteList] = useState<{ gtfsId: string; shortName: string; longName: string; agencyName: string }[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]); // Almacena gtfsId

  // State para filtrado de estaciones
  const [stationList, setStationList] = useState<{ id: string; name: string; routeId: string; routeName: string; agencyName: string }[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]); // Almacena id de estaciones


  useEffect(() => {
    const fetchRouteData = async () => {
      const data = await fetchGtfsData();
      console.log('Route Data Fetched:', data); // Verificar estructura de datos
      setRouteData(data);
    };
    fetchRouteData();
  }, []);

  // Filtrar rutas basado en agencias seleccionadas
  useEffect(() => {
    interface Route {
      gtfsId: string;
      shortName: string;
      longName: string;
      agencyName: string;
    }

    let routes: Route[] = [];

    if (selectedAgencies.length > 0) {
      routeData?.forEach((agency) => {
        if (selectedAgencies.includes(agency.gtfsId)) { // Usar gtfsId
          agency.routes.forEach((route) => {
            routes.push({
              gtfsId: route.gtfsId,
              shortName: route.shortName,
              longName: route.longName,
              agencyName: agency.name,
            });
          });
        }
      });
    } else {
      // Si no hay agencias seleccionadas, mostrar todas las rutas
      routeData?.forEach((agency) => {
        agency.routes.forEach((route) => {
          routes.push({
            gtfsId: route.gtfsId,
            shortName: route.shortName,
            longName: route.longName,
            agencyName: agency.name,
          });
        });
      });
    }

    // Eliminar rutas duplicadas por gtfsId (si es necesario)
    const uniqueRoutes = Array.from(new Map(routes.map(route => [route.gtfsId, route])).values());

    // Ordenar rutas alfabéticamente por agencyName y luego por shortName
    uniqueRoutes.sort((a, b) => {
      if (a.agencyName < b.agencyName) return -1;
      if (a.agencyName > b.agencyName) return 1;
      if (a.shortName < b.shortName) return -1;
      if (a.shortName > b.shortName) return 1;
      return 0;
    });

    setRouteList(uniqueRoutes);
    console.log('Route List:', uniqueRoutes); // Depuración
  }, [selectedAgencies, routeData]);

  // Filtrar estaciones basado en rutas seleccionadas
  useEffect(() => {
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
          if (selectedRoutes.includes(route.gtfsId) && route.stops) { // Usar gtfsId
            route.stops.forEach((stop) => {
              stations.push({
                id: stop.id,
                name: stop.name,
                routeId: route.gtfsId,
                routeName: `${route.shortName} - ${route.longName}`,
                agencyName: agency.name,
              });
            });
          }
        });
      });
    } else {
      // Si no hay rutas seleccionadas, mostrar todas las estaciones
      routeData?.forEach((agency) => {
        agency.routes.forEach((route) => {
          if (route.stops) {
            route.stops.forEach((stop) => {
              stations.push({
                id: stop.id,
                name: stop.name,
                routeId: route.gtfsId,
                routeName: `${route.shortName} - ${route.longName}`,
                agencyName: agency.name,
              });
            });
          }
        });
      });
    }

    // Eliminar estaciones duplicadas basadas en el id
    const uniqueStations = Array.from(new Map(stations.map(station => [station.id, station])).values());

    // Ordenar estaciones alfabéticamente por agencyName, routeName y luego por nombre
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
    console.log('Station List:', uniqueStations); // Depuración
  }, [selectedRoutes, routeData]);

  // Filtrar itinerarios basado en agencias, rutas y estaciones excluidas
  useEffect(() => {
    if (!routeData) {
      setFilteredItineraries(itineraryData);
      return;
    }
  
    // Sets para almacenar las agencias y rutas a excluir
    const agenciesToExclude = new Set<string>();
    const routesToExclude = new Set<string>();
    const routesToExcludeWithStation = new Set<string>();
  
    // Procesar las agencias seleccionadas
    selectedAgencies.forEach(agencyGtfsId => {
      const agency = routeData.find(a => a.gtfsId === agencyGtfsId);
      const agencyRoutes = agency?.routes.map(r => r.gtfsId) || [];
      
      // Rutas seleccionadas dentro de la agencia
      const selectedRoutesForAgency = selectedRoutes.filter(routeGtfsId => agencyRoutes.includes(routeGtfsId));
  
      if (selectedRoutesForAgency.length === 0) {
        // Si no se seleccionaron rutas dentro de la agencia, excluir toda la agencia
        agenciesToExclude.add(agencyGtfsId);
      } else {
        // Si se seleccionaron rutas dentro de la agencia
        selectedRoutesForAgency.forEach(routeGtfsId => {
          if (selectedStations.length > 0) {
            // Si se seleccionaron estaciones, excluir solo las rutas que pasan por esas estaciones
            routesToExcludeWithStation.add(routeGtfsId);
          } else {
            // Si no se seleccionaron estaciones, excluir completamente esas rutas
            routesToExclude.add(routeGtfsId);
          }
        });
      }
    });
  
    // Procesar las rutas seleccionadas que no están asociadas a ninguna agencia seleccionada
    const selectedRoutesNotInAgencies = selectedRoutes.filter(routeGtfsId => {
      return !selectedAgencies.some(agencyGtfsId => {
        const agency = routeData.find(a => a.gtfsId === agencyGtfsId);
        const agencyRoutes = agency?.routes.map(r => r.gtfsId) || [];
        return agencyRoutes.includes(routeGtfsId);
      });
    });
  
    selectedRoutesNotInAgencies.forEach(routeGtfsId => {
      if (selectedStations.length > 0) {
        // Si se seleccionaron estaciones, excluir solo las rutas que pasan por esas estaciones
        routesToExcludeWithStation.add(routeGtfsId);
      } else {
        // Si no se seleccionaron estaciones, excluir completamente esas rutas
        routesToExclude.add(routeGtfsId);
      }
    });
  
    // Filtrar los itinerarios
    const filtered = itineraryData.filter(itinerary => {
      // Excluir itinerarios que tengan al menos un leg que coincida con los criterios de exclusión
      return !itinerary.legs.some(leg => {
        const agencyGtfsId = leg.route?.agency?.gtfsId;
        const routeGtfsId = leg.route?.gtfsId;
        const stationIds = leg.stops ? leg.stops.map(stop => stop.id) : [];
  
        // 1. Excluir itinerarios por agencia completa
        if (agencyGtfsId && agenciesToExclude.has(agencyGtfsId)) {
          return true;
        }
  
        // 2. Excluir itinerarios por rutas completas
        if (routeGtfsId && routesToExclude.has(routeGtfsId)) {
          return true;
        }
  
        // 3. Excluir itinerarios por rutas y estaciones seleccionadas
        if (routeGtfsId && routesToExcludeWithStation.has(routeGtfsId)) {
          // Verificar si el itinerario pasa por alguna de las estaciones seleccionadas
          if (stationIds.some(id => selectedStations.includes(id))) {
            return true;
          }
        }
  
        // Si no coincide con ningún criterio de exclusión
        return false;
      });
    });
  
    console.log('Agencies to Exclude:', Array.from(agenciesToExclude));
    console.log('Routes to Exclude:', Array.from(routesToExclude));
    console.log('Routes to Exclude with Station:', Array.from(routesToExcludeWithStation));
    console.log('Filtered Itineraries:', filtered); // Depuración
    setFilteredItineraries(filtered);
  }, [selectedAgencies, selectedRoutes, selectedStations, itineraryData, routeData]);

  // Actualizar ubicaciones de inicio y fin
  useEffect(() => {
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

  // Obtener ubicación del usuario si no se proporciona startLocation
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

  // Generar una clave simplificada para itinerarios
  function generateSimplifiedItineraryKey(itinerary: Itinerary): string {
    return `${itinerary.legs
      .map((leg) => `${leg.mode}-${leg.from.name}-${leg.to.name}`)
      .join('|')}`;
  }

  // Eliminar itinerarios duplicados
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

  // Función para obtener itinerarios
  const fetchAllItineraries = useCallback(async () => {
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return;
    }

    setLoading(true);
    setIsExpanded(true);

    const currentDate = new Date().toLocaleDateString('en-US'); // Formato MM/DD/YYYY
    console.log('Current Local Date:', currentDate);
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: true });
    console.log('Current Local Time:', currentTime);  
    
    const maxTransfers = 10; // Aumentar para permitir más transferencias
    const numItineraries = 30; // Obtener más itinerarios

    try {
      const { bannedAgencies, bannedRoutes } = generateBannedBlocks(
        selectedAgencies,
        selectedRoutes,
        routeData
      );

      // Consultas para diferentes modos de transporte
      const queries = [
        ITINERARY_QUERY(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_WALK_ONLY(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
        ),
        ITINERARY_QUERY_BUS_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_SUBWAY_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_TRAM_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_RAIL_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_FERRY_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_GONDOLA_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_CABLE_CAR_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_FUNICULAR_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_BUS_SUBWAY_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_SUBWAY_TRAM_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
        ITINERARY_QUERY_ALL_MODES_WALK(
          Number(fromLat),
          Number(fromLon),
          Number(toLat),
          Number(toLon),
          currentDate,
          currentTime,
          maxTransfers,
          numItineraries,
          bannedAgencies,
          bannedRoutes
        ),
      ];

      // Ejecutar todas las consultas y recopilar respuestas
      const results = await Promise.all(queries.map((query) => fetchItineraries(query)));

      // Combinar todos los itinerarios
      let allItineraries = results.flat();

      // Filtrar itinerarios únicos
      const uniqueItineraries = removeDuplicateItineraries(allItineraries);

      // Ordenar itinerarios por duración (más rápido a más largo)
      const sortedItineraries = uniqueItineraries.sort((a, b) => a.duration - b.duration);

      setItineraryData(sortedItineraries);
      console.log('Itinerary Data Set:', sortedItineraries); // Depuración

      // Verificar si los itinerarios tienen legGeometry.points
      sortedItineraries.forEach((itinerary, index) => {
        itinerary.legs.forEach((leg, legIndex) => {
          if (!leg.legGeometry?.points) {
            console.warn(`Itinerary ${index}, Leg ${legIndex} no tiene legGeometry.points`);
          }
        });
      });
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    } finally {
      setLoading(false);
    }
  }, [fromLat, fromLon, toLat, toLon, selectedAgencies, selectedRoutes, routeData]);

  // Ejecutar fetchAllItineraries cuando las coordenadas o filtros cambien
  useEffect(() => {
    if (fromLat && fromLon && toLat && toLon) {
      fetchAllItineraries();
    }
  }, [fromLat, fromLon, toLat, toLon, selectedAgencies, selectedRoutes, fetchAllItineraries]);

  // Manejar la selección y trazado de un itinerario
  const handlePlotItinerary = (itinerary: Itinerary) => {
    if (!itinerary) {
      setSelectedItinerary(itinerary);
    } else {
      itinerary.startNameIti = startName;
      itinerary.endNameIti = endName;

      setSelectedItinerary(itinerary);
    }
    console.log('Itinerario seleccionado para trazar:', itinerary);

    // Verificar si el itinerario tiene legs con legGeometry.points
    itinerary.legs.forEach((leg, index) => {
      if (!leg.legGeometry?.points) {
        console.warn(`Leg ${index} del itinerario seleccionado no tiene legGeometry.points`);
      }
    });

    setTimeout(() => {
      setIsExpanded(false);
    }, 50); // Ajustar el tiempo según sea necesario
    setExpandedLegIndex(null);
  };

  // Manejar la expansión de detalles de un leg
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
          minZoom={10}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            maxZoom={19}
            minZoom={10}
            updateWhenIdle={true}
            keepBuffer={2}
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
            selectedItinerary.legs.map((leg: Leg) => {
              if (leg.legGeometry?.points) {
                const decodedPolyline = polyline.decode(leg.legGeometry.points);
                return (
                  <Polyline
                    key={`${selectedItinerary.id}-${leg.gtfsId}`} // Clave única usando gtfsId
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
        {isExpanded && (
          <div className="p-4 bg-white shadow-md">
            {/* Combobox de agencias */}
            <Autocomplete
              id='agenciess'
              multiple
              options={agencyList}
              disableCloseOnSelect
              value={agencyList.filter(agency => selectedAgencies.includes(agency.gtfsId))}
              getOptionLabel={(option) => option.name}
              onChange={(event, value) => {
                setSelectedAgencies(value.map((agency) => agency.gtfsId)); // Usar gtfsId
                console.log('Selected Agencies:', value.map((agency) => agency.gtfsId));
                // Reset selected routes and stations when agencies change
                setSelectedRoutes([]);
                setSelectedStations([]);
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.gtfsId}> {/* Asegurar clave única */}
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
                  id="agencies-autocomplete"
                  name="agencies"
                />
              )}
            />

            {/* Combobox de rutas */}
            <Autocomplete
              multiple
              options={routeList}
              groupBy={(option) => option.agencyName}
              disableCloseOnSelect
              value={routeList.filter(route => selectedRoutes.includes(route.gtfsId))}
              getOptionLabel={(option) => `${option.shortName} - ${option.longName}`}
              onChange={(event, value) => {
                setSelectedRoutes(value.map((route) => route.gtfsId)); // Usar gtfsId
                console.log('Selected Routes:', value.map((route) => route.gtfsId));
                // Reset selected stations cuando las rutas cambian
                setSelectedStations([]);
              }}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.gtfsId}> {/* Asegurar clave única */}
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<Check fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {`${option.shortName} - ${option.longName}`}
                </li>
              )}
              style={{ width: '100%', marginBottom: '16px' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Excluir por Línea/Ruta"
                  placeholder="Selecciona rutas"
                  id='routes-autocomplete'
                  name='routes'
                />
              )}
            />

          </div>
        )}

        <div className="p-4 flex flex-col">
          {/* Contenido del Menú */}
          {loading ? (
            <p className="text-center">Cargando itinerarios...</p>
          ) : (
            <>
              {filteredItineraries.length > 0 ? (
                <div className="space-y-4 overflow-y-auto">
                  {/* Si el menú está expandido, mostrar todos los itinerarios */}
                  {isExpanded
                    ? filteredItineraries.map((itinerary, index) => (
                        <div key={itinerary.id} className="bg-green-100 p-3 rounded-lg max-w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            {/* Visualización de legs con íconos */}
                            <div className="flex items-center flex-wrap">
                              {itinerary.legs.map((leg, legIndex) => {
                                const color = getColorForLeg(leg);
                                const Icon = getTransportIcon(leg.mode);
                                return (
                                  <React.Fragment key={`${itinerary.id}-${leg.gtfsId}`}>
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        marginRight: '10px',
                                      }}
                                      title={`ETA: ${generateRandomETA()}`}
                                    >
                                      {/* Duración encima del ícono */}
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

                            {/* Botones para detalles y mapeo */}
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
                          {/* Mostrar detalles si está expandido */}
                          {expandedLegIndex === index && (
                            <div className="mt-2">
                              {/* Controles del Slider */}
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
                                  {/* Mostrar leg actual */}
                                  {itinerary.legs[currentLegIndex] && (
                                    <div
                                      className="rounded-lg p-4 text-white"
                                      style={{
                                        backgroundColor: getColorForLeg(
                                          itinerary.legs[currentLegIndex]
                                        ),
                                      }}
                                    >
                                      {/* Detalles del leg */}
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
                                        {itinerary.legs[currentLegIndex].from.name === 'Origin' || !itinerary.legs[currentLegIndex].from.name
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
                      // Si el menú está colapsado, solo mostrar el itinerario seleccionado
                      selectedItinerary && (
                        <div className="bg-green-100 p-3 rounded-lg max-w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            {/* Visualización de legs con íconos */}
                            <div className="flex items-center flex-wrap">
                              {selectedItinerary.legs.map(
                                (leg: Leg, legIndex) => {
                                  const color = getColorForLeg(leg);
                                  const Icon = getTransportIcon(leg.mode);
                                  return (
                                    <React.Fragment key={`${selectedItinerary.id}-${leg.gtfsId}`}>
                                      <div
                                        style={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          marginRight: '10px',
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
                                      {legIndex < selectedItinerary.legs.length - 1 && (
                                        <ArrowForwardIcon style={{ color: 'gray' }} />
                                      )}
                                    </React.Fragment>
                                  );
                                }
                              )}
                            </div>

                            {/* Botones para guardar la ruta */}
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
                              {/* Botón "Guardar Ruta" */}
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
