"use client";

import React, { useState, useEffect, useContext } from "react";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import SubwayIcon from "@mui/icons-material/Subway";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import DeleteIcon from "@mui/icons-material/Delete";
import MapIcon from "@mui/icons-material/Map";
import { Button } from "@mui/material";
import { SelectedItineraryContext } from "../contexts/SelectedItineraryContext";
import { Itinerary, Leg } from "../../app/ItineraryMapComponent";
import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";

const SavedRoutesComponent: React.FC = () => {
  const [savedRoutes, setSavedRoutes] = useState<Itinerary[]>([]);
  const { selectedItinerary, setSelectedItinerary } = useContext(SelectedItineraryContext);
  const router = useRouter();

  useEffect(() => {
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

  return (
    <Layout>
      <div className="flex flex-col h-full justify-start bg-gray-100">
        {/* Alineación exacta del título "Rutas Guardadas" */}
        <div className="flex flex-col items-start w-full pl-5">
          <h2 className="text-xl font-bold text-black mb-4 md:mb-6">
            Rutas Guardadas
          </h2>
        </div>
        <div className="pb-4 flex flex-col w-full px-5">
          {savedRoutes.length === 0 ? (
            <p className="text-gray-500">No hay rutas guardadas.</p>
          ) : (
            <ul className="space-y-6 md:space-y-8">
              {savedRoutes.map((itinerary, index) => (
                <li
                  key={index}
                  className="bg-green-100 p-4 md:p-6 rounded-lg shadow-lg border border-gray-200"
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
                        className="w-1/2 text-red-500 border-red-500 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<MapIcon />}
                        onClick={() => mapSavedRoute(itinerary)}
                        className="w-1/2 bg-blue-500 hover:bg-blue-600"
                      >
                        Mapear Ruta
                      </Button>
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
    </Layout>
  );
};

// Formatea la duración en "Xh Ymin"
const formatDuration = (durationInSeconds: number) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
};

// Obtiene el ícono de transporte basado en el modo
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

export default SavedRoutesComponent;
