"use client";

import React, { useState, useEffect, useContext } from "react";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import SubwayIcon from "@mui/icons-material/Subway";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import DeleteIcon from "@mui/icons-material/Delete";
import MapIcon from "@mui/icons-material/Map";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShareIcon from "@mui/icons-material/Share";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";
import { SelectedItineraryContext } from "@/contexts/SelectedItineraryContext";
import { Itinerary } from "@/types/map";
import MostFrequentedRoutes from "@/components/MostFrequentedRoutes";
import DownloadRouteButton from "@/components/DownloadRouteButton";

const SavedRoutesComponent: React.FC = () => {
  const [savedRoutes, setSavedRoutes] = useState<Itinerary[]>([]);
  const { selectedItinerary, setSelectedItinerary } = useContext(
    SelectedItineraryContext
  );
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedItinerary(null);
    const existingRoutes = JSON.parse(
      localStorage.getItem("savedRoutes") || "[]"
    );
    setSavedRoutes(existingRoutes);
  }, []);

  const deleteRoute = (index: number) => {
    const updatedRoutes = [...savedRoutes];
    updatedRoutes.splice(index, 1);
    setSavedRoutes(updatedRoutes);
    localStorage.setItem("savedRoutes", JSON.stringify(updatedRoutes));
  };

  useEffect(() => {
    console.log(selectedItinerary);
  }, [selectedItinerary]);

  const mapSavedRoute = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
    router.push("/navigation");
  };

  const generateShareUrl = (itinerary: Itinerary) => {
    const url = new URL(window.location.href);
    url.pathname = "/navigation";
    url.searchParams.set("startLat", itinerary.legs[0].from.lat.toString());
    url.searchParams.set("startLon", itinerary.legs[0].from.lon.toString());
    url.searchParams.set("startName", itinerary.startNameIti ?? "");
    url.searchParams.set("startDisplayName", itinerary.startNameIti ?? "");
    url.searchParams.set(
      "endLat",
      itinerary.legs[itinerary.legs.length - 1].to.lat.toString()
    );
    url.searchParams.set(
      "endLon",
      itinerary.legs[itinerary.legs.length - 1].to.lon.toString()
    );
    url.searchParams.set("endName", itinerary.endNameIti ?? "");
    url.searchParams.set("endDisplayName", itinerary.endNameIti ?? "");
    return url.toString();
  };

  const shareRoute = (itinerary: Itinerary) => {
    const shareUrl = generateShareUrl(itinerary);
    const shareData = {
      title: "Ruta Guardada",
      text: `Ruta desde ${itinerary.startNameIti} hasta ${
        itinerary.endNameIti
      }. Duración: ${formatDuration(
        itinerary.duration
      )}. Distancia a pie: ${Math.round(itinerary.walkDistance)}m.`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}\n${shareData.url}`
      );
      alert("Detalles de la ruta copiados al portapapeles.");
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  return (
    <div className="flex flex-col h-full justify-start bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-start w-full mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Rutas Guardadas
        </h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {savedRoutes.length === 0 ? (
          <p className="text-gray-500">No hay rutas guardadas.</p>
        ) : (
          <ul className="space-y-6">
            {savedRoutes.map((itinerary, index) => (
              <li
                key={index}
                className="bg-green-50 p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="w-full md:w-2/3 space-y-2 mb-4 md:mb-0">
                    <p className="text-lg font-semibold text-gray-700">
                      Ruta {index + 1}
                    </p>
                    <p className="text-gray-600">
                      Inicio:{" "}
                      <span className="font-medium">
                        {itinerary.startNameIti}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Destino:{" "}
                      <span className="font-medium">
                        {itinerary.endNameIti}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Duración:{" "}
                      <span className="font-medium">
                        {formatDuration(itinerary.duration)}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Distancia a pie:{" "}
                      <span className="font-medium">
                        {Math.round(itinerary.walkDistance)}m
                      </span>
                    </p>
                  </div>
                  <div className="w-full md:w-1/3 flex space-x-2 md:space-x-3">
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteRoute(index)}
                      className="w-1/3 text-red-500 border-red-500 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<MapIcon />}
                      onClick={() => mapSavedRoute(itinerary)}
                      className="w-1/3 bg-blue-500 hover:bg-blue-600"
                    >
                      Mapear Ruta
                    </Button>
                    <IconButton
                      aria-label="more"
                      aria-controls="long-menu"
                      aria-haspopup="true"
                      onClick={(event) => handleMenuClick(event, index)}
                      className="w-1/3"
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl) && menuIndex === index}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          shareRoute(itinerary);
                          handleMenuClose();
                        }}
                      >
                        <ShareIcon className="mr-2 text-blue-500" />
                        <span className="text-blue-500">Compartir</span>
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <DownloadRouteButton itinerary={itinerary} />
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center space-x-4 md:space-x-6">
                  {itinerary.legs.map((leg, legIndex) => (
                    <div key={legIndex} className="flex items-center mb-3">
                      <div
                        style={{
                          backgroundColor: leg.route?.color
                            ? `#${leg.route.color}`
                            : leg.mode === "WALK"
                            ? "#00BFFF"
                            : "gray",
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-full text-white mr-4 shadow-md"
                      >
                        {getTransportIcon(leg.mode)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {leg.mode}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDuration(leg.duration)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const Page: React.FC = () => {
  const [view, setView] = useState<"saved" | "frequented">("saved");

  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newView: "saved" | "frequented"
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full justify-start bg-gray-100 p-4">
        <div className="flex justify-center mb-4">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleToggle}
            aria-label="view toggle"
          >
            <ToggleButton
              value="saved"
              aria-label="saved routes"
              sx={{
                backgroundColor: "#6ABDA6",
                color: "white",
                "&.Mui-selected": {
                  backgroundColor: "#5AAE96", // Slightly darker shade for selected state
                  color: "white",
                },
                "&:hover": {
                  backgroundColor: "#7BCDB6", // Lighter shade for hover state
                },
              }}
            >
              Rutas Guardadas
            </ToggleButton>
            <ToggleButton
              value="frequented"
              aria-label="frequented routes"
              sx={{
                backgroundColor: "#6ABDA6",
                color: "white",
                "&.Mui-selected": {
                  backgroundColor: "#5AAE96", // Slightly darker shade for selected state
                  color: "white",
                },
                "&:hover": {
                  backgroundColor: "#7BCDB6", // Lighter shade for hover state
                },
              }}
            >
              Rutas Más Frecuentadas
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div className="flex-grow overflow-y-auto">
          {view === "saved" ? (
            <SavedRoutesComponent />
          ) : (
            <MostFrequentedRoutes />
          )}
        </div>
      </div>
    </Layout>
  );
};

const formatDuration = (durationInSeconds: number) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
};

const getTransportIcon = (mode: string) => {
  switch (mode) {
    case "WALK":
      return <DirectionsWalkIcon className="text-white" />;
    case "BUS":
      return <DirectionsBusIcon className="text-white" />;
    case "SUBWAY":
      return <SubwayIcon className="text-white" />;
    case "RAIL":
      return <TrainIcon className="text-white" />;
    case "FERRY":
      return <DirectionsBoatIcon className="text-white" />;
    default:
      return <DirectionsWalkIcon className="text-white" />;
  }
};

export default Page;
