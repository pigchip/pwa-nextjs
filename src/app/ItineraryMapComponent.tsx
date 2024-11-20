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

  // Data provided (omitted for brevity)
  const routeData = {
    data: {
      agencies: [
        {
          id: "QWdlbmN5OjE6U1VC",
          name: "Ferrocarriles Suburbanos",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwNzAwTDE",
              shortName: "1",
              longName: "Buenavista-Cuautitlan"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6Q0M",
          name: "Corredores Concesionados",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwMTBaM0U",
              shortName: "Z3E",
              longName: "Metro Taxqueña - UAM Xochimilco por 18-19"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaM0Q",
              shortName: "Z3D",
              longName: "Metro Taxqueña - UAM Xochimilco por Carmen 8-9"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaM0M",
              shortName: "Z3C",
              longName: "Metro Taxqueña - UAM Xochimilco por Bachilleres 4"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaM0I",
              shortName: "Z3B",
              longName: "Metro Taxqueña - Unidad San Marcos"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaM0g",
              shortName: "Z3H",
              longName: "Metro Taxqueña - UACM Tezonco por Torres"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaM0c",
              shortName: "Z3G",
              longName: "Metro Taxqueña - UACM Tezonco por Escuela"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaM0Y",
              shortName: "Z3F",
              longName: "Metro Taxqueña - Técnicos y Manuales"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMkI",
              shortName: "12B",
              longName: "Lomas de Sotelo - Buenavista"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNEM",
              shortName: "24C",
              longName: "División del Norte - Sauzales"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMkM",
              shortName: "12C",
              longName: "Cuatro Caminos - San Cosme"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNEQ",
              shortName: "24D",
              longName: "Estadio Azteca - Santo Domingo"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMkQ",
              shortName: "12D",
              longName: "Lomas de Sotelo - San Cosme"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaM0E",
              shortName: "Z3A",
              longName: "Metro Taxqueña - Los Reyes Culhuacán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNUE",
              shortName: "25A",
              longName: "Tasqueña - Madreselva"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxM0E",
              shortName: "13A",
              longName: "Ingenieros Militares - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNUI",
              shortName: "25B",
              longName: "Tasqueña - Galeana"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNUM",
              shortName: "25C",
              longName: "Tasqueña - Milpa Alta"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxM0I",
              shortName: "13B",
              longName: "Av. Homero - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMUE",
              shortName: "1A",
              longName: "Cuatro Caminos - Canal de Chalco"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEY",
              shortName: "Z4F",
              longName: "Metro San Lázaro - Valle de Aragón - Múzquiz"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEU",
              shortName: "Z4E",
              longName: "Carretones -Tepito"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEQ",
              shortName: "Z4D",
              longName: "Metro Potrero - Metro Eduardo Molina"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEM",
              shortName: "Z4C",
              longName: "Metro Potrero - Gertrudis Sánchez"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEo",
              shortName: "Z4J",
              longName: "Esmeralda - Metro Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEk",
              shortName: "Z4I",
              longName: "Metro Impulsora - Metro Balbuena"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEg",
              shortName: "Z4H",
              longName: "Metro Impulsora - Pino Suárez"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEc",
              shortName: "Z4G",
              longName: "Metro San Lázaro - Valle de Guadalupe -Múzquiz"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNUQ",
              shortName: "25D",
              longName: "Tasqueña - San Gregorio"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxM0M",
              shortName: "13C",
              longName: "Ejército Nacional - Metro Sevilla"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMUI",
              shortName: "1B",
              longName: "Tacubaya - Canal de Chalco"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMUM",
              shortName: "1C",
              longName: "Barranca del Muerto - Canal de Chalco"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxM0Q",
              shortName: "13D",
              longName: "Av. Homero - Metro Sevilla"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNUU",
              shortName: "25E",
              longName: "Xochimilco - Milpa Alta"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxM0U",
              shortName: "13E",
              longName: "Lomas de Sotelo por Homero - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEI",
              shortName: "Z4B",
              longName: "San Felipe - Santa Anita"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEE",
              shortName: "Z4A",
              longName: "Metro Santa Anita - Vergel"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxNEE",
              shortName: "14A",
              longName: "Metro Tepalcates - San Antonio Abad"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMkE",
              shortName: "2A",
              longName: "Taxqueña - Pirul"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMkI",
              shortName: "2B",
              longName: "C. U. - Pirul"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaNEs",
              shortName: "Z4K",
              longName: "Metro Rio de los Remedios - Metro Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMkE",
              shortName: "22A",
              longName: "Félix Parra Mixcoac - Metro Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMEE",
              shortName: "10A",
              longName: "Panteón San Isidro - Metro Oceanía Norte 172"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMkI",
              shortName: "22B",
              longName: "UPIICSA - Metro Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMEI",
              shortName: "10B",
              longName: "Panteón San Isidro - Peñón"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMkM",
              shortName: "22C",
              longName: "Centro de Abasto - Metro Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMkQ",
              shortName: "22D",
              longName: "Av. 5 Ermita - Metro Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMEM",
              shortName: "10C",
              longName: "RCA Víctor - Peñón"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMEQ",
              shortName: "10D",
              longName: "Metro Camarones - Peñón"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMEU",
              shortName: "10E",
              longName: "Metro Camarones - Manchuria"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyM0E",
              shortName: "23A",
              longName: "CETRAM Tacuba - Especialidades Médicas"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkQ",
              shortName: "Z2D",
              longName: "Metro Barranca del Muerto - Lomas de Tarango"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkM",
              shortName: "Z2C",
              longName: "Metro Barranca del Muerto - Bosques"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkI",
              shortName: "Z2B",
              longName: "Metro Barranca del Muerto - Llano Redondo"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkE",
              shortName: "Z2A",
              longName: "San Ángel - Santa Lucía"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkg",
              shortName: "Z2H",
              longName: "Mixcoac - Queso"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkc",
              shortName: "Z2G",
              longName: "Mixcoac - Puerta Grande"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkY",
              shortName: "Z2F",
              longName: "Metro Mixcoac - San Bartolo"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkU",
              shortName: "Z2E",
              longName: "Metro Mixcoac - Puente Colorado"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyM0I",
              shortName: "23B",
              longName: "CETRAM Tacuba - San Isidro"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMUE",
              shortName: "11A",
              longName: "Cuatro Caminos - Metro Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMUI",
              shortName: "11B",
              longName: "Metro Normal - Pantitlán Calle 7"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyM0M",
              shortName: "23C",
              longName: "CETRAM Tacuba - Tecamachalco"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMUM",
              shortName: "11C",
              longName: "Metro Normal - Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyM0Q",
              shortName: "23D",
              longName: "CETRAM Tacuba - ESIA"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMUQ",
              shortName: "11D",
              longName: "Cuatro Caminos por Flores Magón - Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMUU",
              shortName: "11E",
              longName: "Metro Normal - Canal de San Juan"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMUY",
              shortName: "11F",
              longName: "Cuatro Caminos - Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNEE",
              shortName: "24A",
              longName: "Chapultepec - Preparatoria 5"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxMkE",
              shortName: "12A",
              longName: "Cuatro Caminos - Buenavista"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyNEI",
              shortName: "24B",
              longName: "Merced - Salto del Agua - Cuemanco"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMko",
              shortName: "Z2J",
              longName: "Metro Tacubaya - Tepeaca"
            },
            {
              id: "Um91dGU6MTpDTVgwMTBaMkk",
              shortName: "Z2I",
              longName: "Metro Tacubaya - Cehuayo"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0E",
              shortName: "17A",
              longName: "Caseta a Cuernavaca - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0I",
              shortName: "17B",
              longName: "Xochimilco - Izazaga por Miramontes"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwNUE",
              shortName: "5A",
              longName: "Martín Carrera - Escuela Naval"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0M",
              shortName: "17C",
              longName: "Deportivo Xochimilco - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0Q",
              shortName: "17D",
              longName: "Santiago Tepelcatlalpan - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0U",
              shortName: "17E",
              longName: "Allende - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0Y",
              shortName: "17F",
              longName: "La Joya - Corregiddora"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0c",
              shortName: "17G",
              longName: "La Joya Hospitales - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0g",
              shortName: "17H",
              longName: "Fuentes Brotantes - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0k",
              shortName: "17I",
              longName: "Coapa - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0o",
              shortName: "17J",
              longName: "Totoltepec - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0s",
              shortName: "17K",
              longName: "Tepeximilpa - Izazaga"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxN0w",
              shortName: "17L",
              longName: "San Lázaro-Taxqueña"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOEE",
              shortName: "18A",
              longName: "Valle Dorado - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOEI",
              shortName: "18B",
              longName: "1ro de Mayo - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwNkE",
              shortName: "6A",
              longName: "Barranca del Muerto - Ermita"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOEM",
              shortName: "18C",
              longName: "Valle Dorado - Insurgentes"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOEQ",
              shortName: "18D",
              longName: "Satélite - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMkM",
              shortName: "2C",
              longName: "C. U. - Tlaxopan"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMkQ",
              shortName: "2D",
              longName: "Taxqueña - Tlaxopan"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMkU",
              shortName: "2E",
              longName: "C. U . - Moras"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwMkY",
              shortName: "2F",
              longName: "Taxqueña - Moras"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxNUE",
              shortName: "15A",
              longName: "Av. Ceylán - Av. Central"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxNUI",
              shortName: "15B",
              longName: "Metro Basílica - Pradera"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwM0E",
              shortName: "3A",
              longName: "Iztacala - Politécnico"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxNUM",
              shortName: "15C",
              longName: "Metro Potrero - Bosques de Aragón"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxNkE",
              shortName: "16A",
              longName: "Cuatro Caminos - Alameda"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwNEE",
              shortName: "4A",
              longName: "Alameda Oriente - Constitución"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxNkI",
              shortName: "16B",
              longName: "Cuatro Caminos - Revolución"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwNEI",
              shortName: "4B",
              longName: "Canal de San Juan - Constitución"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxNkM",
              shortName: "16C",
              longName: "Lomas Verdes - Metro Cuitláhuac"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxNkQ",
              shortName: "16D",
              longName: "Echegaray - Metro Cuitláhuac"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwNEM",
              shortName: "4C",
              longName: "Central de Abasto - Alameda Oriente"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwWjE",
              shortName: "Z1",
              longName: "Zonal 1 Cuautepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOUI",
              shortName: "9B",
              longName: "Metro Puebla por Sur 8 - La Valenciana"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOUM",
              shortName: "9C",
              longName: "Tacubaya Contraflujo Eje 3 - La Valenciana"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOUQ",
              shortName: "9D",
              longName: "Metro Puebla por Sur 20 - La Valenciana"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOUU",
              shortName: "9E",
              longName: "Tacubaya por Campeche - Tepalcates"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOUY",
              shortName: "9F",
              longName: "Tacubaya-Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOUE",
              shortName: "9A",
              longName: "Tacubaya por Querétaro - La Valenciana"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUE",
              shortName: "19A",
              longName: "Metro Tacuba por Fray Servando - Metro Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwN0E",
              shortName: "7A",
              longName: "Odontología por puente - Chapultepec por puente"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUI",
              shortName: "19B",
              longName: "Pemex por Fray Servando - Metro Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUM",
              shortName: "19C",
              longName: "Metro Chapultepec - Calle 81"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwN0I",
              shortName: "7B",
              longName: "Odontología - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUQ",
              shortName: "19D",
              longName: "Tacuba - Central de Abasto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwN0M",
              shortName: "7C",
              longName: "Odontología por Av. 504 - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwN0Q",
              shortName: "7D",
              longName: "Odontología por Av. 504 por puente - Chapultepec por Av. 504 por puente"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUU",
              shortName: "19E",
              longName: "Metro Chapultepec - Central de Abasto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUY",
              shortName: "19F",
              longName: "Chapultepec por Boturini - Metro Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUc",
              shortName: "19G",
              longName: "Periférico - Balneario"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUg",
              shortName: "19H",
              longName: "Metro Tacuba - Calle 81"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAxOUk",
              shortName: "19I",
              longName: "Chapultepec-Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOEE",
              shortName: "8A",
              longName: "Bosques - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOEI",
              shortName: "8B",
              longName: "Palmas - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOEM",
              shortName: "8C",
              longName: "Duraznos - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAwOEQ",
              shortName: "8D",
              longName: "Tecamachalco - Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMEE",
              shortName: "20A",
              longName: "Metro Tacubaya - Metro Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMEI",
              shortName: "20B",
              longName: "Tacubaya por Platino - Metro Aeropuerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMEM",
              shortName: "20C",
              longName: "La Raza Línea 3 - Juanacatlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMEQ",
              shortName: "20D",
              longName: "La Raza Línea 5 - Juanacatlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMUE",
              shortName: "21A",
              longName: "Chapultepec por Mazatlán - San Ángel"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMUI",
              shortName: "21B",
              longName: "Chapultepec por Circuito - San Ángel"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMUM",
              shortName: "21C",
              longName: "Barranca del Muerto - San Ángel"
            },
            {
              id: "Um91dGU6MTpDTVgwMTAyMUQ",
              shortName: "21D",
              longName: "Metro Observatorio - San Ángel Clínica 4 y 8"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6SU5URVJVUkJBTk8",
          name: "Tren El Insurgente",
          routes: [
            {
              id: "Um91dGU6MTpDTVgxMDAwMDE",
              shortName: "1",
              longName: "Zinacantepec - Santa Fe"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6Q0JC",
          name: "Cablebus",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwODAwTDM",
              shortName: "3",
              longName: "Los Pinos/Constituyentes a Vasco de Quiroga"
            },
            {
              id: "Um91dGU6MTpDTVgwODAwTDI",
              shortName: "2",
              longName: "Constitución de 1917 a Santa Marta"
            },
            {
              id: "Um91dGU6MTpDTVgwODAwTDE",
              shortName: "1",
              longName: "Cuautepec/Tlalpexco a Indios Verdes"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6TUI",
          name: "Metrobús",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwMzAwTDE",
              shortName: "1",
              longName: "Indios Verdes - El Caminero"
            },
            {
              id: "Um91dGU6MTpDTVgwMzAwTDI",
              shortName: "2",
              longName: "Tepalcates - Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwMzAwTDc",
              shortName: "7",
              longName: "Indios Verdes - Campo Marte"
            },
            {
              id: "Um91dGU6MTpDTVgwMzAwTDM",
              shortName: "3",
              longName: "Tenayuca - Pueblo Sta. Cruz Atoyac"
            },
            {
              id: "Um91dGU6MTpDTVgwMzAwTDQ",
              shortName: "4",
              longName: "Centro Histórico - Buenavista - San Lázaro/AICM T1 y T2/Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwMzAwTDU",
              shortName: "5",
              longName: "Río de lo Remedios - Preparatoria 1"
            },
            {
              id: "Um91dGU6MTpDTVgwMzAwTDY",
              shortName: "6",
              longName: "Villa de Aragón - El Rosario"
            },
            {
              id: "Um91dGU6MTpDTVgwM1NMMDE",
              shortName: "SL01",
              longName: "París - Alameda Tacubaya (Servicio de Apoyo L1)"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6TUVUUk8",
          name: "Sistema de Transporte Colectivo Metro",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwMjBMMTI",
              shortName: "L12",
              longName: "Tláhuac-Mixcoac"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTEI",
              shortName: "B",
              longName: "Ciudad Azteca - Buenavista"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTEE",
              shortName: "A",
              longName: "Pantitlán - La Paz"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDI",
              shortName: "2",
              longName: "Cuatro Caminos - Tasqueña"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDM",
              shortName: "3",
              longName: "Indios verdes - Universidad"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDE",
              shortName: "1",
              longName: "Pantitlán - Observatorio"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDg",
              shortName: "8",
              longName: "Garibaldi - Constitución de 1917"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDk",
              shortName: "9",
              longName: "Pantitlán - Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDY",
              shortName: "6",
              longName: "El Rosario - Martín Carrera"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDc",
              shortName: "7",
              longName: "El Rosario - Barranca del Muerto"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDQ",
              shortName: "4",
              longName: "Santa Anita - Martín Carrera"
            },
            {
              id: "Um91dGU6MTpDTVgwMjAwTDU",
              shortName: "5",
              longName: "Politécnico - Pantitlán"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6VEw",
          name: "Servicio de Tren Ligero",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwNjAwTDE",
              shortName: "1",
              longName: "Tasqueña - Xochimilco"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6UFVNQUJVUw",
          name: "Pumabús",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwOTAwUjY",
              shortName: "PUMA6",
              longName: "Metrobús CU - Estadio Olímpico Universitario"
            },
            {
              id: "Um91dGU6MTpDTVgwOTAwUjU",
              shortName: "PUMA5",
              longName: "Metro Universidad - Av. Universidad"
            },
            {
              id: "Um91dGU6MTpDTVgwOTAwUjQ",
              shortName: "PUMA4",
              longName: "Metro Universidad - Jardín Botánico"
            },
            {
              id: "Um91dGU6MTpDTVgwOTAwUjM",
              shortName: "PUMA3",
              longName: "Metro Universidad - Zona Cultural"
            },
            {
              id: "Um91dGU6MTpDTVgwOTAwUjk",
              shortName: "PUMA9",
              longName: "Metrobús CU - Islas"
            },
            {
              id: "Um91dGU6MTpDTVgwOTAwUjg",
              shortName: "PUMA8",
              longName: "Metrobús CU - Estadio Olímpico Universitario (por alberca)"
            },
            {
              id: "Um91dGU6MTpDTVgwOTAwUjc",
              shortName: "PUMA7",
              longName: "Estadio Olímpico Universitario - Medicina"
            },
            {
              id: "Um91dGU6MTpDTVgwOTAwUjI",
              shortName: "PUMA2",
              longName: "Metro Universidad - Metrobús CU"
            },
            {
              id: "Um91dGU6MTpDTVgwOTAwUjE",
              shortName: "PUMA1",
              longName: "Metro Universidad - Islas"
            },
            {
              id: "Um91dGU6MTpDTVgwOTBSMTM",
              shortName: "PUMA13",
              longName: "Metrobús CU - Unidad de Posgrado"
            },
            {
              id: "Um91dGU6MTpDTVgwOTBSMTE",
              shortName: "PUMA11",
              longName: "Metrobús CU -  AAPAUNAM"
            },
            {
              id: "Um91dGU6MTpDTVgwOTBSMTA",
              shortName: "PUMA10",
              longName: "Metrobús CU - Av. Imán"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6VFJPTEU",
          name: "Trolebús",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwNDAwTDE",
              shortName: "1",
              longName: "Corredor cero emisiones \"Eje Central\""
            },
            {
              id: "Um91dGU6MTpDTVgwNDAwTDQ",
              shortName: "4",
              longName: "Metro Boulevard Puerto Aéreo / Metro El Rosario"
            },
            {
              id: "Um91dGU6MTpDTVgwNDAwTDU",
              shortName: "5",
              longName: "San Felipe de Jesús / Metro Hidalgo"
            },
            {
              id: "Um91dGU6MTpDTVgwNDAwTDI",
              shortName: "2",
              longName: "Corredor cero emisiones \"Eje 2-2A Sur\""
            },
            {
              id: "Um91dGU6MTpDTVgwNDAwTDM",
              shortName: "3",
              longName: "Corredor cero emisiones \"Eje 7-7A Sur\""
            },
            {
              id: "Um91dGU6MTpDTVgwNDAwTDg",
              shortName: "8",
              longName: "Circuito Politécnico"
            },
            {
              id: "Um91dGU6MTpDTVgwNDAwTDk",
              shortName: "9",
              longName: "Villa de Cortés - Apatlaco - Tepalcates"
            },
            {
              id: "Um91dGU6MTpDTVgwNDAwTDY",
              shortName: "6",
              longName: "Metro El Rosario / Metro Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwNDAwTDc",
              shortName: "7",
              longName: "CETRAM Periférico Oriente  - Ciudad Universitaria"
            },
            {
              id: "Um91dGU6MTpDTVgwNDBMMTA",
              shortName: "10",
              longName: "Constitución de 1917 - Acahualtepec"
            },
            {
              id: "Um91dGU6MTpDTVgwNDBMMTI",
              shortName: "12",
              longName: "Tasqueña - Perisur"
            }
          ]
        },
        {
          id: "QWdlbmN5OjE6UlRQ",
          name: "Red de Transporte de Pasajeros",
          routes: [
            {
              id: "Um91dGU6MTpDTVgwNTExMUE",
              shortName: "111-A",
              longName: "Izazaga - Caseta"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEyM0E",
              shortName: "123-A",
              longName: "Pedregal de San Nicolás - Metro Universidad"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMkE",
              shortName: "2-A",
              longName: "Izazaga - San Pedro Martir por FOVISSSTE"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExQU4",
              shortName: "11-A",
              longName: "Aragón por Av. 604 - Metro Chapultepec (Nochebús)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTU3QU4",
              shortName: "57-A",
              longName: "Toreo - Metro Constitución de 1917 (Nochebús)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTU3QVg",
              shortName: "57-A",
              longName: "Toreo - Metro Constitución de 1917 (Expreso)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExQVg",
              shortName: "11-A",
              longName: "Aragón por Av. 604 - Metro Chapultepec (Expreso)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMzM",
              shortName: "33",
              longName: "León de los Aldama - Metro Chabacano"
            },
            {
              id: "Um91dGU6MTpDTVgwNTM0QkU",
              shortName: "34-B",
              longName: "Parque de la Bombilla - Centro comercial Santa Fe (Ecobús)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMzc",
              shortName: "37",
              longName: "U.C.T.M. Atzacoalco - Carmen Serdán"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNTk",
              shortName: "159",
              longName: "Metro Constitución de 1917 - Palmitas"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAyN0E",
              shortName: "27-A",
              longName: "Reclusorio Norte - Metro Hidalgo/Alameda Central"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAzOUI",
              shortName: "39-B",
              longName: "Av. Santa Ana - Xochimilco/Bosque de Nativitas"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEyNEE",
              shortName: "124-A",
              longName: "Tepeaca - Metro Mixcoac"
            },
            {
              id: "Um91dGU6MTpDTVgwNTM0Qk8",
              shortName: "34-B",
              longName: "Parque de la Bombilla - Centro comercial Santa Fe (Ordinario)"
            },
            {
              id: "Um91dGU6MTpDTVgwNUUzTDE",
              shortName: "Ordinario3 L1",
              longName: "Balderas - Alameda Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNjE",
              shortName: "161",
              longName: "Metro Constitución de 1917 - Ampliación Santiago"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNjI",
              shortName: "162",
              longName: "Santa Catarina - Metro Constitución de 1917"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNjM",
              shortName: "163",
              longName: "San Miguel Teotongo/Guadalupe  -  Metro Zaragoza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwNDM",
              shortName: "43",
              longName: "San Felipe/León de Los Aldama -  Central de Abastos"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNjQ",
              shortName: "164",
              longName: "Colonia Miguel de la Madrid -  Metro Zaragoza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNjY",
              shortName: "166",
              longName: "Colonia Ixtlahuacan Avisadero -  Metro Zaragoza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNjc",
              shortName: "167",
              longName: "Avisadero/Colonia Miravalle -  Metro Zaragoza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNjg",
              shortName: "168",
              longName: "Arenal 4ta. Sección - Metro Pantitlán"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEwMUI",
              shortName: "101-B",
              longName: "Colonia Forestal - La Villa Ferroplaza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEwMUE",
              shortName: "101-A",
              longName: "Ampliación Malacates -  La Villa/Ferroplaza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExM0I",
              shortName: "113-B",
              longName: "Col. Navidad (Las Piedras) - Metro Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEwMUQ",
              shortName: "101-D",
              longName: "La Brecha Cocoyotes - La Villa Ferroplaza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwNTk",
              shortName: "59",
              longName: "Metro El Rosario - Metro Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxN0U",
              shortName: "17-E",
              longName: "Metro Universidad - San Pedro Martir por Carretera Federal"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxN0Y",
              shortName: "17-F",
              longName: "Metro Tasqueña - San Pedro Martir por FOVISSSTE"
            },
            {
              id: "Um91dGU6MTpDTVgwNUUyTDE",
              shortName: "Ordinario2 L1",
              longName: "Balderas - CETRAM Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwNjk",
              shortName: "69",
              longName: "Estadio Azteca - Loloigque"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExNUE",
              shortName: "115-A",
              longName: "Las Águilas - Metro Chapultepec"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAzNEE",
              shortName: "34-A",
              longName: "Metro Balderas - Centro Comercial Santa Fe"
            },
            {
              id: "Um91dGU6MTpDTVgwNTA0NkM",
              shortName: "46-C",
              longName: "Lienzo Charro/Santa Catarina - Central de Abasto"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMTA",
              shortName: "110",
              longName: "Chimalpa - Metro Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMTI",
              shortName: "112",
              longName: "Ampliación Jalalpa - Metro Tacubaya (Av. Jalisco)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMTY",
              shortName: "116",
              longName: "Santa Rosa Xochiac - Metro Mixcoac"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMTg",
              shortName: "118",
              longName: "Santa Rosa Xochiac - Metro Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMTk",
              shortName: "119",
              longName: "Piloto - Metro Tacubya (Av. Jalisco)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTQ3QU4",
              shortName: "47-A",
              longName: "Alameda Oriente - Xochimilco / Bosque de Nativitas (Nochebús)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTA1OUE",
              shortName: "59-A",
              longName: "Metro el Rosario  - Sullivan"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE0NEM",
              shortName: "144-C",
              longName: "San Salvador Cuahutenco - Villa Milpa Alta"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2NUFP",
              shortName: "165-A",
              longName: "Ejército de Oriente - Metro Constitución de 1917 (Ordinario)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2NUFF",
              shortName: "165-A",
              longName: "Ejército de Oriente - Metro Constitución de 1917 (Ecobús)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTQ3QVg",
              shortName: "47-A",
              longName: "Alameda Oriente - Xochimilco / Bosque de Nativitas (Expreso)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMjA",
              shortName: "120",
              longName: "Metro Zapata - San Mateo Tlaltenango"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMjQ",
              shortName: "124",
              longName: "Puerta Grande - Metro Mixcoac"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMjU",
              shortName: "125",
              longName: "Bosques del Pedregal - Metro Universidad por López Portillo"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMjY",
              shortName: "126",
              longName: "Magdalena Atlitico a Metro Copilco"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2NUFY",
              shortName: "165-A",
              longName: "Ejército de Oriente - Metro Constitución de 1917 (Expreso)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMjg",
              shortName: "128",
              longName: "San Bernabé/Oyamel - Metro Universidad"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE0NUE",
              shortName: "145-A",
              longName: "Santiago Tepalcatlalpan - República del Salvador"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEyMUE",
              shortName: "121-A",
              longName: "San Bartolo - Metro Zapata"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMzE",
              shortName: "131",
              longName: "Estadio Azteca - Caseta Cuernavaca"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMzI",
              shortName: "132",
              longName: "Tlalmille - Estadio Azteca"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMTI",
              shortName: "12",
              longName: "Aragón - Panteón San Isidro"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMzQ",
              shortName: "134",
              longName: "Santo Tomás Ajusco - Estadio Azteca"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMTg",
              shortName: "18",
              longName: "Metro Cuatro Caminos -  Colonia Moctezuma 2da. Sección"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMTk",
              shortName: "19",
              longName: "Metro El Rosario - Parque México por Cuitláhuac"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEzNEI",
              shortName: "134-B",
              longName: "Estadio Azteca - Topilejo"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEzNEE",
              shortName: "134-A",
              longName: "Parres - Estadio Azteca"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxM0E",
              shortName: "13-A",
              longName: "Metro Chapultepec - Torres de Padierna/Pedregal de San Nicolás"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExMEM",
              shortName: "110-C",
              longName: "La Pila - Metro Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExMEI",
              shortName: "110-B",
              longName: "San Lorenzo Acopilco - Metro Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMUQ",
              shortName: "1-D",
              longName: "Metro Santa Martha -  Metro Mixcoac"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEzNEQ",
              shortName: "134-D",
              longName: "Topilejo - Metro Universidad"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEzNEM",
              shortName: "134-C",
              longName: "Santo Tomás Ajusco - Metro Universidad"
            },
            {
              id: "Um91dGU6MTpDTVgwNTA4MUE",
              shortName: "81-A",
              longName: "San Gregorio Atlapulco - Metro Taxqueña"
            },
            {
              id: "Um91dGU6MTpDTVgwNUU0TDE",
              shortName: "Ordinario4 L1",
              longName: "Observatorio - Tacubaya"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDE",
              shortName: "141",
              longName: "Villa Milpa Alta - Metro Tláhuac"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDI",
              shortName: "142",
              longName: "Tulyehualco - Xochimilco/Palmas"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDM",
              shortName: "143",
              longName: "Villa Milpa Alta - Metro Tasqueña"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDQ",
              shortName: "144",
              longName: "San Pablo Oztotepec -  Xochimilco/Palmas"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMjM",
              shortName: "23",
              longName: "Colonia El Tepetatal (El Charco) - Metro La Raza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDU",
              shortName: "145",
              longName: "Pedregal de San Francisco - Xochimilco/Palmas"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDY",
              shortName: "146",
              longName: "San Miguel Tehuizco - Xochimilco/Palmas"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwMjU",
              shortName: "25",
              longName: "Zacatenco - Metro Potrero"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDc",
              shortName: "147",
              longName: "San Bartolomé Xicomulco - Xochimilco/Palmas"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDg",
              shortName: "148",
              longName: "San Nicolás Tetelco - Metro Tláhuac"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxNDk",
              shortName: "149",
              longName: "Mixquic - Metro Tláhuac"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2M0I",
              shortName: "163-B",
              longName: "San Miguel Teotongo/Avisadero -  Metro Zaragoza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2M0E",
              shortName: "163-A",
              longName: "San Miguel Teotongo/Torres  -  Metro Zaragoza/M. Tepalcates"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAzMUI",
              shortName: "31-B",
              longName: "Izazaga- Deportivo Xochimilco"
            },
            {
              id: "Um91dGU6MTpDTVgwNTA1N0M",
              shortName: "57-C",
              longName: "Toreo - Metro Constitución de 1917"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMDE",
              shortName: "101",
              longName: "Lomas de Cuautepec - La Villa Ferroplaza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMDI",
              shortName: "102",
              longName: "La Brecha - Metro Indios Verdes"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMDM",
              shortName: "103",
              longName: "Ampliación Malacates - Metro la Raza (Linea 3)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMDQ",
              shortName: "104",
              longName: "Colonia El Tepetatal (El Charco) -  Metro Potrero"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMDc",
              shortName: "107",
              longName: "Metro El Rosario - Metro Tacuba"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxMDg",
              shortName: "108",
              longName: "Colonia El Tepetatal (El Charco)  -  Metro Indios Verdes"
            },
            {
              id: "Um91dGU6MTpDTVgwNTIwME4",
              shortName: "200",
              longName: "Circuito Bicentenario (Nochebús)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExNU8",
              shortName: "115",
              longName: "Jesús del Monte (Cuajimalpa) - Metro Tacubaya (Ordinario)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExNU4",
              shortName: "115",
              longName: "Jesús del Monte (Cuajimalpa) - Metro Tacubaya (Nochebús)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTIwMFg",
              shortName: "200",
              longName: "Circuito Bicentenario (Expreso)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAxOUE",
              shortName: "19-A",
              longName: "Metro El Rosario - Parque México por Normal"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExNkE",
              shortName: "116-A",
              longName: "Río Guadalupe - Metro General Anaya"
            },
            {
              id: "Um91dGU6MTpDTVgwNUUxTDE",
              shortName: "Ordinario1 L1",
              longName: "Balderas - Observatorio"
            },
            {
              id: "Um91dGU6MTpDTVgwNTA3NkE",
              shortName: "76-A",
              longName: "Centro Comercial Santa Fe – Metro Auditorio por Reforma"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2MUQ",
              shortName: "161-D",
              longName: "Colonia Buenavista - Central de Abasto"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2MUM",
              shortName: "161-C",
              longName: "Metro Constitución de 1917 - Palmas"
            },
            {
              id: "Um91dGU6MTpDTVgwNTA1MkM",
              shortName: "52-C",
              longName: "Metro Santa Martha - Metro Zapata"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2MUY",
              shortName: "161-F",
              longName: "Barranca de Guadalupe - Metro Constitución de 1917"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2MUU",
              shortName: "161-E",
              longName: "San José Buenavista - Metro Constitución de 1917"
            },
            {
              id: "Um91dGU6MTpDTVgwNTA3Nk4",
              shortName: "76",
              longName: "Centro Comercial Santa Fe -  Metro Auditorio por Palmas (Nochebús)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTAwOUM",
              shortName: "9-C",
              longName: "Centro Comercial Santa Fe  - Tlacuitlapa/Puerta Grande"
            },
            {
              id: "Um91dGU6MTpDTVgwNTA3Nlg",
              shortName: "76",
              longName: "Centro Comercial Santa Fe -  Metro Auditorio por Palmas (Expreso)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTMwMEI",
              shortName: "300-B",
              longName: "Paseo Acoxpa - Santa Fe (UAM Cuajimalpa)"
            },
            {
              id: "Um91dGU6MTpDTVgwNTMwMEE",
              shortName: "300-A",
              longName: "Paseo Acoxpa - Metro Auditorio"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2MkQ",
              shortName: "162-D",
              longName: "Santa Catarina - Metro Universidad"
            },
            {
              id: "Um91dGU6MTpDTVgwNTE2MkI",
              shortName: "162-B",
              longName: "Campestre Potrero - Metro Zaragoza"
            },
            {
              id: "Um91dGU6MTpDTVgwNTEwN0I",
              shortName: "107-B",
              longName: "La Villa/Cantera - Metro Tacuba por Ceylán"
            },
            {
              id: "Um91dGU6MTpDTVgwNTExOUI",
              shortName: "119-B",
              longName: "Presidentes - Metro Mixcoac"
            }
          ]
        }
      ]
    },
  };

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
      routeData.data.agencies.forEach((agency) => {
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

    // Sort routes alphabetically by agencyName and then by route longName
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
    // Update filtered itineraries based on selected agencies and routes
    let filtered = itineraryData;

    if (selectedAgencies.length > 0) {
      filtered = filtered.filter((itinerary) =>
        itinerary.legs.some(
          (leg) => leg.route?.agency?.id && selectedAgencies.includes(leg.route.agency.id)
        )
      );
    }

    if (selectedRoutes.length > 0) {
      filtered = filtered.filter((itinerary) =>
        itinerary.legs.some((leg) => leg.route?.id && selectedRoutes.includes(leg.route.id))
      );
    }

    setFilteredItineraries(filtered);
  }, [selectedAgencies, selectedRoutes, itineraryData]);

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

        {/* Combobox de agencias */}
        <div className="p-4 bg-white shadow-md">
          <Autocomplete
            multiple
            options={agencyList}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            onChange={(event, value) => {
              setSelectedAgencies(value.map((agency) => agency.id));
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
                label="Filtrar por Agencia"
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
            style={{ width: '100%' }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Filtrar por Línea/Ruta"
                placeholder="Selecciona rutas"
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
                                          : itinerary.legs[currentLegIndex].from.name}
                                      </p>
                                      <p>
                                        <strong>Hasta:</strong>{' '}
                                        {itinerary.legs[currentLegIndex].to.name === 'Destination'
                                          ? endLocation?.display_name
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
