import { PathOptions } from 'leaflet';

export const toggleExpand = (
  isExpanded: boolean,
  setIsExpanded: (value: boolean) => void
) => {
  setIsExpanded(!isExpanded);
};

export const saveRouteToLocalStorage = (
  selectedItinerary: any,
  startName: string,
  endName: string,
  showModal: (message: string) => void
) => {
  if (selectedItinerary) {
    const existingRoutes = JSON.parse(
      localStorage.getItem("savedRoutes") || "[]"
    );

    const itineraryToSave = {
      ...selectedItinerary,
      startNameIti: startName,
      endNameIti: endName,
    };

    existingRoutes.push(itineraryToSave);
    localStorage.setItem("savedRoutes", JSON.stringify(existingRoutes));

    showModal("Ruta guardada exitosamente");
    console.log("Ruta guardada:", itineraryToSave);
  } else {
    showModal("No hay ruta seleccionada para guardar");
  }
};


// Function to generate random ETA
export const generateRandomETA = () => {
  const baseMinutes = 5;
  const randomSeconds = Math.floor(Math.random() * 121) - 60; // Random number between -60 and 60
  const eta = new Date();
  eta.setMinutes(eta.getMinutes() + baseMinutes);
  eta.setSeconds(eta.getSeconds() + randomSeconds);
  return eta.toLocaleTimeString();
};

export function formatDistance(distance: number) {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)} km`;
  }
  return `${Math.round(distance)} m`;
}


export const formatDuration = (durationInSeconds: number) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${minutes} min ${seconds} s`;
  } else if (minutes > 0) {
    return `${minutes} min ${seconds} s`;
  } else {
    return `${seconds} s`;
  }
};

export const formatTimeWithAmPm = (timeInMilliseconds: number) => {
  const date = new Date(timeInMilliseconds);

  // Convertir a hora local
  let hours = date.getHours(); // getHours() obtiene la hora local
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const amPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convierte 0 horas en 12 para formato 12 horas

  return `${hours}:${minutes}:${seconds} ${amPm}`;
};


export const getColorForLeg = (leg: { route?: { color?: string }, mode: string }) => {
  return leg.route?.color ? `#${leg.route.color}` : leg.mode === 'WALK' ? '#00BFFF' : 'gray';
};

export const getPolylineStyle = (leg: { mode: string, route?: { color?: string } }): PathOptions => {
  if (leg.mode === 'WALK') {
    return {
      color: '#00BFFF',
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