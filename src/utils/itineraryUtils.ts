export const toggleExpand = (
  isExpanded: boolean,
  setIsExpanded: (value: boolean) => void
) => {
  setIsExpanded(!isExpanded);
};

export const saveRouteToLocalStorage = (
  selectedItinerary: any,
  startName: string,
  endName: string
) => {
  if (selectedItinerary) {
    const existingRoutes = JSON.parse(
      localStorage.getItem("savedRoutes") || "[]"
    );

    console.log("startName:", startName);
    console.log("endName:", endName);

    const itineraryToSave = {
      ...selectedItinerary,
      startNameIti: startName,
      endNameIti: endName,
    };

    existingRoutes.push(itineraryToSave);

    localStorage.setItem("savedRoutes", JSON.stringify(existingRoutes));
    alert("Ruta guardada exitosamente");
    console.log("Ruta guardada:", itineraryToSave);
  } else {
    alert("No hay ruta seleccionada para guardar");
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

export const formatDuration = (durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

