// FILE: DownloadRouteButton.tsx
import React from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { Itinerary } from "@/types/map";

interface DownloadRouteButtonProps {
  itinerary: Itinerary;
}

const DownloadRouteButton: React.FC<DownloadRouteButtonProps> = ({ itinerary }) => {
  const downloadRoute = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(itinerary));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `route_${itinerary.startNameIti}_to_${itinerary.endNameIti}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <Button
      variant="text"
      startIcon={<DownloadIcon />}
      onClick={downloadRoute}
      className="w-full text-blue-500 hover:bg-blue-100"
    >
      Descargar
    </Button>
  );
};

export default DownloadRouteButton;