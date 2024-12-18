"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { Close as CloseIcon, Lock, Map } from '@mui/icons-material';
import LayoutNoHeader from '@/components/LayoutNoHeader';
import Animation from '../Animation';
import Modal from '../Modal';

interface Geometry {
  lat: number;
  lon: number;
}

interface Stop {
  name: string;
  lat: number;
  lon: number;
}

interface Pattern {
  geometry: Geometry[];
  stops: Stop[];
}

interface Route {
  shortName: string;
  longName: string;
  color: string;
  agency: {
    name: string;
  };
  patterns: Pattern[];
}

interface Station {
  id: number;
  name: string;
  line: number | string;
  transport: string;
  incident: string;
  services: string;
  information: string;
}

interface Line {
  id: number;
  name: string;
  transport: string;
  incident: string;
  speed: number;
  information: string;
}

interface ApiRoute {
  id: number;
  name: string;
  line: number;
  price: number;
}

interface SelectedStation {
  id: number;
  name: string;
  line: string;
  lineId: number;
  transport: string;
  incident: string;
  services: string;
  information: string;
}

interface UserOpinionResponseItem {
  opinions: Opinion;
  v: Station | Line;
}

interface SelectedLine {
  longName: string;
  id: number;
  name: string;
  transport: string;
  incident: string;
  speed: number;
  information: string;
}

interface Opinion {
  id: number;
  user: number;
  date: string;
  time: string;
  body: string;
  type: string;
  place: string;
}

interface Incident {
  id: number;
  name: string;
  line: number | string;
  incident: string;
  services: string;
  information: string;
  lat: number;
  lon: number;
  agency: string;
  route: string;
}

interface InteractiveMapComponentProps {
  selectedRoutes: string[];
  displayedRoutes: Route[];
  handlePolylineClick: (route: Route) => void;
  handleMarkerClick: (stationInfo: any, stop: Stop, route: Route) => void;
  findStationInfo: (
    stopName: string,
    lat: number,
    lon: number,
    agencyName: string
  ) => { station: any; line: any } | null;
  getStationLogo: (agencyName: string) => string;
  incidents: Incident[]; // Asegúrate de que sea Incident[] y no Station[]
  showIncidents: boolean;
}

const InteractiveMapComponent = dynamic(() => import('@/components/InteractiveMapComponent'), {
  ssr: false,
});

interface RoutesMapProps {
}

const RoutesMap: React.FC<RoutesMapProps> = () => {
  // Estados y variables
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedLatLon, setSelectedLatLon] = useState<{ lat: number; lon: number }>({ lat: 123, lon: 123 });
  const [stationsData, setStationsData] = useState<Station[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [linesData, setLinesData] = useState<Line[]>([]);
  const [apiRoutesData, setApiRoutesData] = useState<ApiRoute[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<SelectedStation | null>(null);
  const [selectedLine, setSelectedLine] = useState<SelectedLine | null>(null);
  const [stationTransfers, setStationTransfers] = useState<Station[]>([]);
  const [stationRoutes, setStationRoutes] = useState<any[]>([]);
  const [stationSchedules, setStationSchedules] = useState<{ [key: number]: any }>({});
  const [stationOpinions, setStationOpinions] = useState<any[]>([]);
  const [lineRoutes, setLineRoutes] = useState<any[]>([]);
  const [lineSchedules, setLineSchedules] = useState<{ [key: number]: any }>({});
  const [lineOpinions, setLineOpinions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRoutesDropdownOpen, setIsRoutesDropdownOpen] = useState<boolean>(false);
  const [userOpinions, setUserOpinions] = useState<Opinion[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [showUserOpinionsModal, setShowUserOpinionsModal] = useState<boolean>(false);
  const [editingOpinion, setEditingOpinion] = useState<Opinion | null>(null);
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showIncidents, setShowIncidents] = useState<boolean>(false);
  const [stopsData, setStopsData] = useState<Stop[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  const openModal = (title: string, message: string) => {
    setModalContent({ title, message });
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSelectLatLon = (lat: number, lon: number) => {
    setSelectedLatLon({ lat, lon });
  };
  
  useEffect(() => {
    const lt = parseFloat(localStorage.getItem('latx') ?? '123');
    const ln = parseFloat(localStorage.getItem('lonx') ?? '123');
  
    if (lt !== 123 && ln !== 123 && (selectedLatLon.lat !== lt || selectedLatLon.lon !== ln)) {
      handleSelectLatLon(lt, ln);
    }
  }, [selectedLatLon]);

  const toggleMapInteraction = () => {
    setDropdownOpen(false);
    setIsRoutesDropdownOpen(false);
    setIsMapInteractive((prev) => !prev);
  };
  // Función para validar email
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Obtener el ID del usuario mediante su email
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail && validateEmail(storedEmail)) {
      fetchUserId(storedEmail);
    } else {
      
    }
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUserId = async (email: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/userByEmail/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message);
      } else {
        const data = await response.json();
        setUserId(data.id);
      }
    } catch (error) {
      setError('No se pudo conectar con la API externa.');
    }
  };

  // Fetch de datos iniciales
  useEffect(() => {
    async function fetchData() {
      try {
        const routesData = await fetchRoutes();
        setRoutes(routesData);

        const stationsData = await fetchStations();
        setStationsData(stationsData);

        const linesData = await fetchLines();
        setLinesData(linesData);

        const apiRoutesData = await fetchApiRoutes();
        setApiRoutesData(apiRoutesData);

        // Extraer todas las paradas de las rutas
        const allStops = routesData.flatMap(route =>
          route.patterns.flatMap(pattern => pattern.stops)
        );
        setStopsData(allStops);
      } catch (err: any) {
        setError(err.message);
      }
    }

    async function fetchRoutes(): Promise<Route[]> {
      const query = `
        query {
          routes {
            shortName
            longName
            color
            agency {
              name
            }
            patterns {
              geometry {
                lat
                lon
              }
              stops {
                name
                lat
                lon
              }
            }
          }
        }
      `;
      
      const otpUrl = process.env.NEXT_PUBLIC_OTP_API_BASE_URL;
      const response = await fetch(`${otpUrl}otp/routers/default/index/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        throw new Error("Error en la red al intentar llamar a la API");
      }
      const data = await response.json();
      return data.data.routes;
    }

    async function fetchStations(): Promise<Station[]> {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}api/stations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener las estaciones desde la API");
      }
      const data: Station[] = await response.json();
      return data;
    }

    async function fetchLines(): Promise<Line[]> {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}api/lines`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener las líneas desde la API");
      }
      const data: Line[] = await response.json();
      return data;
    }

    async function fetchApiRoutes(): Promise<ApiRoute[]> {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}api/routes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener las rutas desde la API");
      }
      const data: ApiRoute[] = await response.json();
      return data;
    }

    fetchData();
  }, []);

// Inside your RoutesMap component

useEffect(() => {
  async function fetchIncidents() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}api/stations/incidents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los incidentes desde la API");
      }
      const data: Station[] = await response.json();

      // Map Station[] to Incident[]
      const mappedIncidents: Incident[] = data.map((incidentStation) => {
        // Find associated stops
        const associatedStops = stopsData.filter(
          (stop) => normalizeString(stop.name) === normalizeString(incidentStation.name)
        );

        // Select a stop to get coordinates
        const selectedStop = associatedStops[0]; // Adjust as needed

        if (selectedStop) {
          // Find the corresponding line
          const lineInfo = linesData.find(
            (line) => line.id === incidentStation.line
          );

          // Extract agency and route names
          const agencyName = lineInfo ? lineInfo.transport : "Desconocido";
          const routeName = lineInfo ? lineInfo.name : "Desconocido";

          return {
            id: incidentStation.id,
            name: incidentStation.name,
            line: incidentStation.line,
            incident: incidentStation.incident,
            services: incidentStation.services,
            information: incidentStation.information,
            lat: selectedStop.lat,
            lon: selectedStop.lon,
            agency: agencyName, // Populate agency name
            route: routeName,   // Populate route name
          };
        } else {
          console.warn(`No se encontró una parada asociada para la estación: ${incidentStation.name}`);
          // Decide how to handle this case, e.g., omit the incident
          return null;
        }
      }).filter((incident): incident is Incident => incident !== null); // Filter out nulls

      setIncidents(mappedIncidents);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (stationsData.length > 0 && stopsData.length > 0) {
    fetchIncidents();
  }
}, [stationsData, stopsData, linesData]); // Added linesData as a dependency

  
  
  // Funciones de manejo de eventos y lógica
  const handleAgencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const agencyName = event.target.value;
    const isChecked = event.target.checked;
  
    setSelectedAgencies((prevAgencies) => {
      if (!isChecked) {
        // Si se deselecciona la agencia, eliminar también sus rutas de selectedRoutes
        setSelectedRoutes((prevSelectedRoutes) =>
          prevSelectedRoutes.filter(
            (routeValue) => !filteredRoutes
              .filter((route) => route.agency.name === agencyName)
              .some((route) => `${route.shortName}-${agencyName}` === routeValue)
          )
        );
      }
      return isChecked
        ? [...prevAgencies, agencyName]
        : prevAgencies.filter((name) => name !== agencyName);
    });
  };
  

  useEffect(() => {
    const sortedRoutes = routes
      .filter((route) => selectedAgencies.includes(route.agency.name))
      .sort((a, b) => a.shortName.localeCompare(b.shortName));
    setFilteredRoutes(sortedRoutes);
  }, [selectedAgencies, routes]);

  const handleRouteSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const routeValue = event.target.value;
    const isChecked = event.target.checked;

    setSelectedRoutes((prevSelectedRoutes) =>
      isChecked ? [...prevSelectedRoutes, routeValue] : prevSelectedRoutes.filter((value) => value !== routeValue)
    );
  };

  const toggleRoutesDropdown = () => {
    // Cerrar ventanas abiertas al abrir el menú de rutas
    setSelectedStation(null);
    setStationTransfers([]);
    setStationRoutes([]);
    setStationSchedules({});
    setStationOpinions([]);

    setSelectedLine(null);
    setLineRoutes([]);
    setLineSchedules({});
    setLineOpinions([]);

    setShowUserOpinionsModal(false);
    setUserOpinions([]);
    setEditingOpinion(null);

    setIsRoutesDropdownOpen(!isRoutesDropdownOpen);
    setDropdownOpen(false);
  };

  const displayedRoutes = selectedRoutes.length > 0 ? filteredRoutes.filter((route) => {
    return selectedRoutes.includes(route.shortName);
  }) : [];

  function getStationLogo(agencyName: string): string {
    switch (agencyName) {
      case 'Metrobús':
        return '/icons/metrobus.svg';
      case 'Red de Transporte de Pasajeros':
        return '/icons/rtp.svg';
      case 'Servicio de Transportes Eléctricos':
        return '/icons/ste.svg';
      case 'Cablebús':
      case 'Cablebus':
        return '/icons/cablebus.svg';
      case 'Ferrocarriles Suburbanos':
        return '/icons/ferro.svg';
      case 'Corredores Concesionados':
        return '/icons/corredores.svg';
      case 'Tren Ligero':
        return '/icons/ste.svg';
      case 'Sistema de Transporte Colectivo Metro':
        return '/icons/metro.svg';
      case 'Tren El Insurgente':
        return '/icons/tei.svg';
      case 'Trolebús':
        return '/icons/ste.svg';
      case 'Servicio de Tren Ligero':
        return '/icons/ste.svg';
      default:
        return '/icons/default.svg';
    }
  }

  function normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function findStationInfo(
    stopName: string,
    lat: number,
    lon: number,
    agencyName: string
  ): { station: Station; line: Line } | null {
    const agencyMap: { [key: string]: string } = {
      'Cablebus': 'Cablebús',
      'Metrobús': 'Metrobús',
      'Servicio de Tren Ligero': 'Tren Ligero',
      'Sistema de Transporte Colectivo Metro': 'Sistema de Transporte Colectivo Metro',
      'Red de Transporte de Pasajeros': 'Red de Transporte de Pasajeros',
      'Trolebús': 'Trolebús',
      'Servicio de Transportes Eléctricos': 'Trolebús',
    };

    const apiAgencyName = agencyMap[agencyName];
    if (!apiAgencyName) {
      return null;
    }

    const normalizedStopName = normalizeString(stopName);

    if (!stationsData.length || !linesData.length) {
      return null;
    }

    for (const station of stationsData) {
      const normalizedStationName = normalizeString(station.name);
      if (normalizedStationName === normalizedStopName) {
        const line = linesData.find((line) => line.id === station.line);
        if (line && line.transport.includes(apiAgencyName)) {
          return { station, line };
        }
      }
    }

    return null;
  }

  const handleMarkerClick = (
    stationInfo: { station: Station; line: Line } | null,
    stop: Stop,
    route: Route
  ) => {
    // Cerrar cualquier ventana de línea abierta
    setSelectedLine(null);
    setLineRoutes([]);
    setLineSchedules({});
    setLineOpinions([]);

    // Cerrar ventana de "Mis comentarios" y menú de rutas
    setShowUserOpinionsModal(false);
    setIsRoutesDropdownOpen(false);

    // Restablecer variables de estado relacionadas con la estación
    setStationTransfers([]);
    setStationRoutes([]);
    setStationSchedules({});
    setStationOpinions([]);

    if (stationInfo) {
      const { station, line } = stationInfo;

      setSelectedStation({
        id: station.id,
        name: station.name,
        line: line.name,
        lineId: line.id,
        transport: line.transport,
        incident: station.incident,
        services: station.services,
        information: station.information,
      });

      const fetchAdditionalData = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
          const transfersResponse = await fetch(`${apiUrl}api/stations/${station.id}/transfers`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!transfersResponse.ok) {
            throw new Error("Error al obtener los transbordos desde la API");
          }
          const transfersData: Station[] = await transfersResponse.json();
          setStationTransfers(transfersData);

          const routesResponse = await fetch(`${apiUrl}/api/lines/${line.id}/routes`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!routesResponse.ok) {
            throw new Error("Error al obtener las rutas desde la API");
          }
          const routesData: any[] = await routesResponse.json();
          setStationRoutes(routesData);

          const schedulesResults: { [key: number]: any } = {};
          for (const routeItem of routesData) {
            const scheduleResponse = await fetch(`${apiUrl}/api/routes/${routeItem.id}/schedules`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (!scheduleResponse.ok) {
              throw new Error("Error al obtener los horarios desde la API");
            }
            const scheduleData = await scheduleResponse.json();
            schedulesResults[routeItem.id] = scheduleData;
          }
          setStationSchedules(schedulesResults);

          const opinionsResponse = await fetch(`${apiUrl}/api/stations/${station.id}/opinions`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!opinionsResponse.ok) {
            throw new Error("Error al obtener las opiniones desde la API");
          }
          const opinionsData: any[] = await opinionsResponse.json();
          setStationOpinions(opinionsData);

        } catch (err) {
          console.error('Error al obtener datos adicionales:', err);
        }
      };

      fetchAdditionalData();

    } else {
      setSelectedStation({
        id: 0,
        name: stop.name,
        line: route.shortName,
        lineId: 0,
        transport: route.agency.name,
        incident: '',
        services: '',
        information: 'Información no disponible',
      });

      // Restablecer variables de estado aquí también
      setStationTransfers([]);
      setStationRoutes([]);
      setStationSchedules({});
      setStationOpinions([]);
    }
  };

  const handlePolylineClick = async (route: Route) => {
    // Cerrar cualquier ventana de estación abierta
    setSelectedStation(null);
    setStationTransfers([]);
    setStationRoutes([]);
    setStationSchedules({});
    setStationOpinions([]);

    // Cerrar ventana de "Mis comentarios" y menú de rutas
    setShowUserOpinionsModal(false);
    setIsRoutesDropdownOpen(false);

    // Restablecer variables de estado relacionadas con la línea
    setLineRoutes([]);
    setLineSchedules({});
    setLineOpinions([]);

    const line = findLineInfo(route);

    if (line) {
      setSelectedLine({
        longName: route.longName,
        id: line.id,
        name: line.name,
        transport: line.transport,
        incident: line.incident,
        speed: line.speed,
        information: line.information,
      });

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
        const routesResponse = await fetch(`${apiUrl}api/lines/${line.id}/routes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!routesResponse.ok) {
          throw new Error("Error al obtener las rutas de la línea desde la API");
        }
        const routesData: any[] = await routesResponse.json();
        setLineRoutes(routesData);

        const schedulesResults: { [key: number]: any } = {};
        for (const routeItem of routesData) {
          const scheduleResponse = await fetch(`${apiUrl}/api/routes/${routeItem.id}/schedules`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!scheduleResponse.ok) {
            throw new Error("Error al obtener los horarios desde la API");
          }
          const scheduleData = await scheduleResponse.json();
          schedulesResults[routeItem.id] = scheduleData;
        }
        setLineSchedules(schedulesResults);

        const opinionsResponse = await fetch(`${apiUrl}/api/lines/${line.id}/opinions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!opinionsResponse.ok) {
          throw new Error("Error al obtener las opiniones de la línea desde la API");
        }
        const opinionsData: any[] = await opinionsResponse.json();
        setLineOpinions(opinionsData);

      } catch (err) {
        console.error('Error al obtener datos de la línea:', err);
      }

    } else {
      setSelectedLine(null);
    }
  };

  function findLineInfo(route: Route): Line | null {
    const agencyMap: { [key: string]: string } = {
      'Cablebus': 'Cablebús',
      'Metrobús': 'Metrobús',
      'Servicio de Tren Ligero': 'Tren Ligero',
      'Sistema de Transporte Colectivo Metro': 'Sistema de Transporte Colectivo Metro',
      'Red de Transporte de Pasajeros': 'Red de Transporte de Pasajeros',
      'Trolebús': 'Trolebús',
      'Servicio de Transportes Eléctricos': 'Trolebús',
    };

    const apiAgencyName = agencyMap[route.agency.name];
    if (!apiAgencyName) {
      return null;
    }

    const normalizedRouteName = normalizeString(route.shortName);

    if (apiAgencyName === 'Red de Transporte de Pasajeros') {
      const apiRoute = apiRoutesData.find(apiRoute => {
        const normalizedApiRouteName = normalizeString(apiRoute.name);

        // Usamos expresiones regulares para hacer una coincidencia exacta de palabras
        const regex = new RegExp(`\\b${normalizedRouteName}\\b`);
        return regex.test(normalizedApiRouteName);
      });

      if (apiRoute) {
        const line = linesData.find(line => line.id === apiRoute.line);
        return line || null;
      } else {
        return null;
      }
    }

    if (apiAgencyName === 'Trolebús') {
      const routeNumber = normalizedRouteName.split(' ')[0];
      const line = linesData.find(line => {
        const normalizedLineName = normalizeString(line.name);
        return normalizedLineName === routeNumber && line.transport.includes(apiAgencyName);
      });
      return line || null;
    }

    for (const line of linesData) {
      const normalizedLineName = normalizeString(line.name);
      if (normalizedLineName === normalizedRouteName && line.transport.includes(apiAgencyName)) {
        return line;
      }
    }

    return null;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!routes.length || !stationsData.length || !linesData.length || !apiRoutesData.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Animation />
      </div>
    );
  }

  // Función para manejar el envío de opiniones
  const handleOpinionSubmit = async (event: React.FormEvent<HTMLFormElement>, isStation: boolean, id: number) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const body = formData.get('body') as string;
    const type = formData.get('type') as string;

    if (!userId || !body || !type) {
      openModal("Error", "Por favor, complete todos los campos.");
      return;
    }

    if (body.length > 60) {
      openModal("Error", "El mensaje no puede tener más de 60 caracteres.");
      return;
    }

    const currentDate = new Date();
    const date = currentDate.toISOString().split('T')[0];
    const time = currentDate.toTimeString().split(' ')[0];

    const opinionData = {
      user: userId,
      date,
      time,
      body,
      type,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}api/${isStation ? 'stations' : 'lines'}/${id}/opinions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opinionData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la opinión.');
      }

      openModal("Éxito", "Opinión enviada correctamente.");

      // Actualizar las opiniones
      if (isStation) {
        setStationOpinions([...stationOpinions, { ...opinionData, id: Date.now() }]);
      } else {
        setLineOpinions([...lineOpinions, { ...opinionData, id: Date.now() }]);
      }

      // Resetear el formulario
      form.reset();

    } catch (err) {
      console.error('Error al enviar la opinión:', err);
    }
  };

  // Funciones para manejar la sección "Mis comentarios"
  const handleUserOpinions = async () => {
    if (!userId) {
      openModal("Error", "No se encontro el ID de usuario.");
      return;
    }

    // Cerrar ventanas abiertas
    setSelectedStation(null);
    setStationTransfers([]);
    setStationRoutes([]);
    setStationSchedules({});
    setStationOpinions([]);

    setSelectedLine(null);
    setLineRoutes([]);
    setLineSchedules({});
    setLineOpinions([]);

    setIsRoutesDropdownOpen(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}api/user/${userId}/opinions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las opiniones del usuario.');
      }

      const data: UserOpinionResponseItem[] = await response.json();

      // Procesar opiniones y asociar lugar (nombre de la estación o línea)
      const opinions = data.map((item) => {
        const opinion: Opinion = item.opinions;
        const place = item.v.name; // Nombre de la estación o línea
        return { ...opinion, place };
      });
  
      setUserOpinions(opinions);
      setShowUserOpinionsModal(true);
  
    } catch (err) {
      console.error('Error al obtener las opiniones del usuario:', err);
    }
  };

  const handleEditOpinion = (opinion: Opinion) => {
    setEditingOpinion(opinion);
  };

  const handleDeleteOpinion = async (opinionId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}api/opinions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: opinionId }),
      });

      if (!response.ok) {
        throw new Error('Error al borrar la opinión.');
      }

      openModal("Éxito", "Opinión borrada correctamente.");

      setUserOpinions(userOpinions.filter(op => op.id !== opinionId));

    } catch (err) {
      console.error('Error al borrar la opinión:', err);
    }
  };

  const handleUpdateOpinion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingOpinion) return;

    const formData = new FormData(event.currentTarget);
    const body = formData.get('body') as string;
    const type = formData.get('type') as string;

    if (!body || !type) {
      openModal("Advertencia", "Por favor, complete todos los campos.");
      return;
    }

    if (body.length > 60) {
      openModal("Advertencia", "El mensaje no puede tener más de 60 caracteres.");
      return;
    }

    const opinionData = {
      id: editingOpinion.id,
      body,
      type,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL_STATIONS;
      const response = await fetch(`${apiUrl}api/opinions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opinionData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la opinión.');
      }

      openModal("Éxito", "Opinión actualizada correctamente.");

      setUserOpinions(userOpinions.map(op => op.id === editingOpinion.id ? { ...op, body, type } : op));
      setEditingOpinion(null);

    } catch (err) {
      console.error('Error al actualizar la opinión:', err);
    }
  };

  return selectedLatLon.lat !== 123 && selectedLatLon.lon !== 123 ? (
    <LayoutNoHeader>
          <div className="relative w-full h-50vh">
      <h1 className="text-center text-2xl font-bold my-4">Rutas de Transporte</h1>

      <div className="flex flex-wrap justify-center mb-4 space-x-4 z-20 relative">
      <div className="relative inline-block">
            <button
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setIsRoutesDropdownOpen(false);
              }}
            >
              Agencias
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg w-48">
                <div className="p-2">
                  {[...new Set(routes.map((route) => route.agency.name))].map((agency) => (
                    <label key={agency} className="block">
                      <input
                        type="checkbox"
                        value={agency}
                        checked={selectedAgencies.includes(agency)}
                        onChange={handleAgencyChange}
                        className="mr-2"
                      />
                      {agency}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

        <div className="relative">
          <button
            onClick={toggleRoutesDropdown}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            {selectedRoutes.length > 0 ? `Rutas seleccionadas (${selectedRoutes.length})` : 'Seleccione rutas'}
          </button>
          {isRoutesDropdownOpen && (
            <div className="absolute bg-white border border-gray-300 z-10 w-64 h-64 overflow-y-auto p-2 mt-1">
              {selectedAgencies.map((agency) => (
                <div key={`agency-${agency}`} className="mb-2">
                  <strong>{`Rutas de ${agency}`}</strong>
                  <div>
                    {filteredRoutes
                      .filter((route) => route.agency.name === agency)
                      .map((route, index) => (
                        <label key={`${route.shortName}-${agency}-${index}`} className="block">
                          <input
                            type="checkbox"
                            value={`${route.shortName}-${agency}`}
                            checked={selectedRoutes.includes(`${route.shortName}-${agency}`)}
                            onChange={handleRouteSelection}
                            className="mr-2"
                          />
                          {route.shortName} - {route.longName}
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setShowIncidents(prev => !prev)}
            className={`bg-${showIncidents ? "blue" : "red"}-500 text-white px-4 py-2 rounded hover:bg-${showIncidents ? "gray" : "orange"}-600 transition`}
          >
            {showIncidents ? 'Ocultar Incidentes' : 'Ver Incidentes'}
          </button>
        </div>
      </div>

      <div>
        {/* Contenedor del mapa */}
        <div className="relative w-full h-full">
        <InteractiveMapComponent
            lat={selectedLatLon.lat}
            lon={selectedLatLon.lon}
            selectedRoutes={selectedRoutes}
            displayedRoutes={filteredRoutes.filter(route =>
              selectedRoutes.includes(`${route.shortName}-${route.agency.name}`)
            )}
            
            handlePolylineClick={handlePolylineClick}
            handleMarkerClick={handleMarkerClick}
            findStationInfo={findStationInfo}
            getStationLogo={getStationLogo}
            incidents={incidents}
            showIncidents={showIncidents}
          />
        </div>

        {/* Ventana emergente para la estación */}
        {selectedStation && (
          <div className="fixed top-5 right-5 w-80 h-96 bg-white p-4 border border-gray-300 z-30 overflow-y-auto">
            <button
              onClick={() => {
                setSelectedStation(null);
                setStationTransfers([]);
                setStationRoutes([]);
                setStationSchedules({});
                setStationOpinions([]);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700 transition"
            >
              <CloseIcon />
            </button>
            <div className="flex items-center">
              <img src={getStationLogo(selectedStation.transport)} alt={selectedStation.transport} className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">{selectedStation.name}</h3>
            </div>
            <p><strong>Transporte:</strong> {selectedStation.transport}</p>
            <p><strong>Línea:</strong> {selectedStation.line}</p>

            {/* Mostrar información adicional solo si el ID no es 0 */}
            {selectedStation.id !== 0 && (
              <>
                <p><strong>Incidente:</strong> {selectedStation.incident || 'No hay incidentes reportados'}</p>
                <p><strong>Servicios:</strong> {selectedStation.services || 'No disponible'}</p>
                <p><strong>Información:</strong> {selectedStation.information || 'No disponible'}</p>
              </>
            )}

            {stationTransfers.length > 0 && (
              <div>
                <h4 className="font-semibold mt-2">Transbordos:</h4>
                <ul className="list-disc list-inside">
                  {stationTransfers.map((transfer) => {
                    const line = linesData.find(line => line.id === transfer.line);
                    const transport = line ? line.transport : 'Desconocido';
                    return (
                      <li key={transfer.id} className="flex items-center">
                        <img src={getStationLogo(transport)} alt={transport} className="w-4 h-4 mr-1" />
                        {transfer.name} - {transport}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {stationRoutes.length > 0 && (
              <div>
                <h4 className="font-semibold mt-2">Rutas:</h4>
                {stationRoutes.map((route) => {
                  const scheduleData = stationSchedules[route.id];
                  const schedules = scheduleData && scheduleData.schedules ? scheduleData.schedules : [];
                  return (
                    <div key={route.id} className="mt-1">
                      <p><strong>Ruta:</strong> {route.name}</p>
                      <p><strong>Precio:</strong> ${route.price}</p>
                      {schedules.length > 0 && (
                        <div>
                          <p><strong>Horarios:</strong></p>
                          <ul className="list-disc list-inside">
                            {schedules.map((schedule: any) => (
                              <li key={schedule.id}>
                                {schedule.day}: {schedule.open} - {schedule.close}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {stationOpinions.length > 0 && (
              <div>
                <h4 className="font-semibold mt-2">Opiniones:</h4>
                <ul className="list-disc list-inside">
                  {stationOpinions.map((opinion) => (
                    <li key={opinion.id} className="mt-1">
                      <span><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</span>
                      <p>{opinion.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Ventana emergente para la línea */}
        {selectedLine && (
          <div className="fixed top-5 right-5 w-80 h-96 bg-white p-4 border border-gray-300 z-30 overflow-y-auto">
            <button
              onClick={() => {
                setSelectedLine(null);
                setLineRoutes([]);
                setLineSchedules({});
                setLineOpinions([]);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700 transition"
            >
              <CloseIcon />
            </button>
            <div className="flex items-center">
              <img src={getStationLogo(selectedLine.transport)} alt={selectedLine.transport} className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Línea {selectedLine.name} {selectedLine.longName}</h3>
            </div>
            <p><strong>Transporte:</strong> {selectedLine.transport}</p>
            {selectedLine.id !== 0 && (
              <>
                <p><strong>Incidente:</strong> {selectedLine.incident || 'No hay incidentes reportados'}</p>
                <p><strong>Velocidad:</strong> {selectedLine.speed} km/h</p>
                <p><strong>Información:</strong> {selectedLine.information || 'No disponible'}</p>
              </>
            )}

            {lineRoutes.length > 0 && (
              <div>
                <h4 className="font-semibold mt-2">Rutas de la línea:</h4>
                {lineRoutes.map((route) => {
                  const scheduleData = lineSchedules[route.id];
                  const schedules = scheduleData && scheduleData.schedules ? scheduleData.schedules : [];
                  return (
                    <div key={route.id} className="mt-1">
                      <p><strong>Ruta:</strong> {route.name}</p>
                      <p><strong>Precio:</strong> ${route.price}</p>
                      {schedules.length > 0 && (
                        <div>
                          <p><strong>Horarios:</strong></p>
                          <ul className="list-disc list-inside">
                            {schedules.map((schedule: any) => (
                              <li key={schedule.id}>
                                {schedule.day}: {schedule.open} - {schedule.close}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {lineOpinions.length > 0 && (
              <div>
                <h4 className="font-semibold mt-2">Opiniones:</h4>
                <ul className="list-disc list-inside">
                  {lineOpinions.map((opinion) => (
                    <li key={opinion.id} className="mt-1">
                      <span><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</span>
                      <p>{opinion.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    </LayoutNoHeader>
  ) : (
    <Layout>
      <div className="relative w-full h-50vh">
        <h1 className="text-center text-2xl font-bold my-4">Rutas de Transporte</h1>
 
        <div className="flex flex-wrap justify-center mb-4 space-x-4 z-20 relative">
          <div className="relative inline-block">
            <button
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setIsRoutesDropdownOpen(false);
              }}
            >
              Agencias
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg w-48">
                <div className="p-2">
                  {[...new Set(routes.map((route) => route.agency.name))].map((agency) => (
                    <label key={agency} className="block">
                      <input
                        type="checkbox"
                        value={agency}
                        checked={selectedAgencies.includes(agency)}
                        onChange={handleAgencyChange}
                        className="mr-2"
                      />
                      {agency}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleRoutesDropdown}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {selectedRoutes.length > 0 ? `Rutas seleccionadas (${selectedRoutes.length})` : 'Seleccione rutas'}
            </button>
            {isRoutesDropdownOpen && (
              <div className="absolute bg-white border border-gray-300 z-10 w-64 h-64 overflow-y-auto p-2 mt-1">
                {selectedAgencies.map((agency) => (
                  <div key={`agency-${agency}`} className="mb-2">
                    <strong>{`Rutas de ${agency}`}</strong>
                    <div>
                      {filteredRoutes
                        .filter((route) => route.agency.name === agency)
                        .map((route, index) => (
                          <label key={`${route.shortName}-${agency}-${index}`} className="block">
                            <input
                              type="checkbox"
                              value={`${route.shortName}-${agency}`}
                              checked={selectedRoutes.includes(`${route.shortName}-${agency}`)}
                              onChange={handleRouteSelection}
                              className="mr-2"
                            />
                            {route.shortName} - {route.longName}
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setShowIncidents(prev => !prev)}
              className={`bg-${showIncidents ? "blue" : "red"}-500 text-white px-4 py-2 rounded hover:bg-${showIncidents ? "gray" : "orange"}-600 transition`}
            >
              {showIncidents ? 'Ocultar Incidentes' : 'Ver Incidentes'}
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                setShowUserOpinionsModal(true);
                setSelectedStation(null);
                setSelectedLine(null);
                setStationTransfers([]);
                setStationRoutes([]);
                setStationSchedules({});
                setStationOpinions([]);
                setLineRoutes([]);
                setLineSchedules({});
                setLineOpinions([]);
                setIsRoutesDropdownOpen(false);
                setDropdownOpen(false);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Mis comentarios
            </button>
          </div>
        </div>

        <div>
          {/* Contenedor del mapa */}
          <div className="relative w-full h-4/5">
            {!isMapInteractive && (
              <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex items-center justify-center">
                <p className="text-white font-bold text-lg">
                  Toca el botón azul para interactuar con el mapa
                </p>
              </div>
            )}
          <InteractiveMapComponent
              lat={123}
              lon={123}
              selectedRoutes={selectedRoutes}
              displayedRoutes={filteredRoutes.filter(route =>
                selectedRoutes.includes(`${route.shortName}-${route.agency.name}`)
              )}
              
              handlePolylineClick={handlePolylineClick}
              handleMarkerClick={handleMarkerClick}
              findStationInfo={findStationInfo}
              getStationLogo={getStationLogo}
              incidents={incidents}
              showIncidents={showIncidents}
            />
          </div>

          {/* Ventana emergente para la estación */}
          {selectedStation && (
            <div className="fixed top-5 right-5 w-80 h-96 bg-white p-4 border border-gray-300 z-30 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedStation(null);
                  setStationTransfers([]);
                  setStationRoutes([]);
                  setStationSchedules({});
                  setStationOpinions([]);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700 transition"
              >
                <CloseIcon />
              </button>
              <div className="flex items-center">
                <img src={getStationLogo(selectedStation.transport)} alt={selectedStation.transport} className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">{selectedStation.name}</h3>
              </div>
              <p><strong>Transporte:</strong> {selectedStation.transport}</p>
              <p><strong>Línea:</strong> {selectedStation.line}</p>

              {/* Mostrar información adicional solo si el ID no es 0 */}
              {selectedStation.id !== 0 && (
                <>
                  <p><strong>Incidente:</strong> {selectedStation.incident || 'No hay incidentes reportados'}</p>
                  <p><strong>Servicios:</strong> {selectedStation.services || 'No disponible'}</p>
                  <p><strong>Información:</strong> {selectedStation.information || 'No disponible'}</p>
                </>
              )}

              {stationTransfers.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Transbordos:</h4>
                  <ul className="list-disc list-inside">
                    {stationTransfers.map((transfer) => {
                      const line = linesData.find(line => line.id === transfer.line);
                      const transport = line ? line.transport : 'Desconocido';
                      return (
                        <li key={transfer.id} className="flex items-center">
                          <img src={getStationLogo(transport)} alt={transport} className="w-4 h-4 mr-1" />
                          {transfer.name} - {transport}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {stationRoutes.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Rutas:</h4>
                  {stationRoutes.map((route) => {
                    const scheduleData = stationSchedules[route.id];
                    const schedules = scheduleData && scheduleData.schedules ? scheduleData.schedules : [];
                    return (
                      <div key={route.id} className="mt-1">
                        <p><strong>Ruta:</strong> {route.name}</p>
                        <p><strong>Precio:</strong> ${route.price}</p>
                        {schedules.length > 0 && (
                          <div>
                            <p><strong>Horarios:</strong></p>
                            <ul className="list-disc list-inside">
                              {schedules.map((schedule: any) => (
                                <li key={schedule.id}>
                                  {schedule.day}: {schedule.open} - {schedule.close}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Formulario para agregar opinión */}
              {selectedStation.id !== 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Agregar comentario</h4>
                  <form onSubmit={(e) => handleOpinionSubmit(e, true, selectedStation.id)} className="space-y-2">
                    <div>
                      <label className="block font-semibold">Mensaje (máx. 60 caracteres):</label>
                      <input type="text" name="body" maxLength={60} required className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block font-semibold">Tipo:</label>
                      <select name="type" defaultValue="Agradecimiento" className="w-full border rounded px-2 py-1">
                        <option value="Sugerencia">Sugerencia</option>
                        <option value="Queja">Queja</option>
                        <option value="Agradecimiento">Agradecimiento</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
                      Enviar comentario
                    </button>
                  </form>
                </div>
              )}

              {stationOpinions.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Opiniones:</h4>
                  <ul className="list-disc list-inside">
                    {stationOpinions.map((opinion) => (
                      <li key={opinion.id} className="mt-1">
                        <span><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</span>
                        <p>{opinion.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Ventana emergente para la línea */}
          {selectedLine && (
            <div className="fixed top-5 right-5 w-80 h-96 bg-white p-4 border border-gray-300 z-30 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedLine(null);
                  setLineRoutes([]);
                  setLineSchedules({});
                  setLineOpinions([]);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700 transition"
              >
                <CloseIcon />
              </button>
              <div className="flex items-center">
                <img src={getStationLogo(selectedLine.transport)} alt={selectedLine.transport} className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Línea {selectedLine.name} {selectedLine.longName}</h3>
              </div>
              <p><strong>Transporte:</strong> {selectedLine.transport}</p>
              {selectedLine.id !== 0 && (
                <>
                  <p><strong>Incidente:</strong> {selectedLine.incident || 'No hay incidentes reportados'}</p>
                  <p><strong>Velocidad:</strong> {selectedLine.speed} km/h</p>
                  <p><strong>Información:</strong> {selectedLine.information || 'No disponible'}</p>
                </>
              )}

              {lineRoutes.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Rutas de la línea:</h4>
                  {lineRoutes.map((route) => {
                    const scheduleData = lineSchedules[route.id];
                    const schedules = scheduleData && scheduleData.schedules ? scheduleData.schedules : [];
                    return (
                      <div key={route.id} className="mt-1">
                        <p><strong>Ruta:</strong> {route.name}</p>
                        <p><strong>Precio:</strong> ${route.price}</p>
                        {schedules.length > 0 && (
                          <div>
                            <p><strong>Horarios:</strong></p>
                            <ul className="list-disc list-inside">
                              {schedules.map((schedule: any) => (
                                <li key={schedule.id}>
                                  {schedule.day}: {schedule.open} - {schedule.close}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Formulario para agregar opinión */}
              {selectedLine.id !== 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Agregar comentario</h4>
                  <form onSubmit={(e) => handleOpinionSubmit(e, false, selectedLine.id)} className="space-y-2">
                    <div>
                      <label className="block font-semibold">Mensaje (máx. 60 caracteres):</label>
                      <input type="text" name="body" maxLength={60} required className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block font-semibold">Tipo:</label>
                      <select name="type" defaultValue="Agradecimiento" className="w-full border rounded px-2 py-1">
                        <option value="Sugerencia">Sugerencia</option>
                        <option value="Queja">Queja</option>
                        <option value="Agradecimiento">Agradecimiento</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
                      Enviar comentario
                    </button>
                  </form>
                </div>
              )}
              
              {lineOpinions.length > 0 && (
                <div>
                  <h4 className="font-semibold mt-2">Opiniones:</h4>
                  <ul className="list-disc list-inside">
                    {lineOpinions.map((opinion) => (
                      <li key={opinion.id} className="mt-1">
                        <span><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</span>
                        <p>{opinion.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Ventana modal para "Mis comentarios" */}
          {showUserOpinionsModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative overflow-y-auto max-h-full">
                <button
                  onClick={() => {
                    setShowUserOpinionsModal(false);
                    setUserOpinions([]);
                    setEditingOpinion(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition"
                >
                  <CloseIcon />
                </button>
                <h3 className="text-xl font-bold mb-4">Mis comentarios</h3>

                <button
                  onClick={handleUserOpinions}
                  className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Ver comentarios
                </button>

                {userOpinions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Comentarios:</h4>
                    <ul className="space-y-4">
                      {userOpinions.map((opinion) => (
                        <li key={opinion.id} className="border p-3 rounded-lg">
                          <p><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</p>
                          <p><strong>Lugar:</strong> {opinion.place}</p>
                          <p>{opinion.body}</p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleEditOpinion(opinion)}
                              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteOpinion(opinion.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                            >
                              Borrar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {editingOpinion && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Editando comentario ID {editingOpinion.id}</h4>
                    <form onSubmit={handleUpdateOpinion} className="space-y-3">
                      <div>
                        <label className="block font-semibold">Mensaje (máx. 60 caracteres):</label>
                        <input
                          type="text"
                          name="body"
                          maxLength={60}
                          defaultValue={editingOpinion.body}
                          required
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold">Tipo:</label>
                        <select
                          name="type"
                          defaultValue={editingOpinion.type}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="Sugerencia">Sugerencia</option>
                          <option value="Queja">Queja</option>
                          <option value="Agradecimiento">Agradecimiento</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                      >
                        Actualizar comentario
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón flotante */}
          <button
            onClick={toggleMapInteraction}
            className={`fixed bottom-28 left-5 z-20 w-14 h-14 flex items-center justify-center rounded-full 
              ${isMapInteractive ? "bg-green-500" : "bg-blue-500"} shadow-lg transition`}
          >
            {isMapInteractive ? (
              <Lock className="text-white" />
            ) : (
              <Map className="text-white" />
            )}
          </button>

          <Modal
            isOpen={modalOpen}
            onClose={closeModal}
            title={modalContent.title}
            message={modalContent.message}
          />
        </div>
      </div>
    </Layout>
  );
};

export default RoutesMap;
