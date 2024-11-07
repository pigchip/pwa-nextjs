export const toggleExpand = (isExpanded: boolean, setIsExpanded: (value: boolean) => void) => {
    setIsExpanded(!isExpanded);
  };
  
  export const saveRouteToLocalStorage = (
    selectedItinerary: any,
    startName: string,
    endName: string
  ) => {
    if (selectedItinerary) {
      const existingRoutes = JSON.parse(localStorage.getItem("savedRoutes") || "[]");
  
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