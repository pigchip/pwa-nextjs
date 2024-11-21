"use client";

import RoutesMap from "@/app/interactive-map/page";
import React from "react";

interface MapWithMarkerProps {
  lat: number;
  lon: number;
}

const MapWithMarker: React.FC<MapWithMarkerProps> = ({ lat, lon }) => {
  return (
    <div className="relative w-full h-screen">
      <RoutesMap lat={lat} lon={lon} />
    </div>
  );
};

export default MapWithMarker;
