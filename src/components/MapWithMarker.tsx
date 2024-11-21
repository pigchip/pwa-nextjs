"use client";

import RoutesMap from "@/app/interactive-map/page";
import React, { useEffect, useState } from "react";

interface MapWithMarkerProps {
  lat: string;
  lon: string;
}

const MapWithMarker: React.FC<MapWithMarkerProps> = ({ lat, lon }) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('latx', lat);
    localStorage.setItem('lonx', lon);
  }, [lat, lon]);

  useEffect(() => {
    const lt = localStorage.getItem('latx');
    const ln = localStorage.getItem('lonx');
    if (lt && ln) {
      setLatitude(parseFloat(lt));
      setLongitude(parseFloat(ln));
    }
  }, []);

  return (
    <div className="relative w-full h-screen">
      {latitude !== null && longitude !== null ? (
        <RoutesMap />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default MapWithMarker;