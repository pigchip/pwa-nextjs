"use client";

import React, { useEffect } from "react";
import L, { LatLngTuple } from "leaflet";
import polyline from "@mapbox/polyline";

interface MapXProps {
  routeData?: any;
}

const MapX: React.FC<MapXProps> = ({ routeData }) => {
  useEffect(() => {
    const map = L.map("map", {
      center: [19.432608, -99.133209],
      zoom: 12,
      zoomControl: true,
      minZoom: 12,
      maxZoom: 14,
    });

    L.tileLayer("/tiles/{z}_{x}_{y}.png", {
      maxZoom: 14,
      minZoom: 12,
      attribution: "Tiles provided by local storage",
    }).addTo(map);    

    if (routeData) {
      const markers: L.Marker[] = [];

      // Crear íconos personalizados para inicio y fin
      const startIcon = L.divIcon({
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid #00bcd4;
            background-color: rgba(0, 188, 212, 0.2);
            z-index: 1;
          ">
            <div style="
              width: 20px;
              height: 20px;
              background-color: #00bcd4;
              border-radius: 50%;
            "></div>
          </div>
        `,
        className: "",
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      });

      const endIcon = L.divIcon({
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid #ff5722;
            background-color: rgba(255, 87, 34, 0.2);
            z-index: 1;
          ">
            <div style="
              width: 20px;
              height: 20px;
              background-color: #ff5722;
              border-radius: 50%;
            "></div>
          </div>
        `,
        className: "",
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      });

      // Coordenadas iniciales (from) y finales (to)
      const startLocation = routeData.legs[0]?.from;
      const endLocation = routeData.legs[routeData.legs.length - 1]?.to;

      // Marcador de inicio
      if (startLocation?.lat && startLocation?.lon) {
        const startMarker = L.marker([startLocation.lat, startLocation.lon], {
          icon: startIcon,
        })
          .bindPopup(`<b>Inicio:</b> ${startLocation.name}`)
          .addTo(map);
        markers.push(startMarker);
      }

      // Marcador de fin
      if (endLocation?.lat && endLocation?.lon) {
        const endMarker = L.marker([endLocation.lat, endLocation.lon], {
          icon: endIcon,
        })
          .bindPopup(`<b>Fin:</b> ${endLocation.name}`)
          .addTo(map);
        markers.push(endMarker);
      }

      // Dibujar las rutas de los legs
      routeData.legs.forEach((leg: any) => {
        const pointsString = leg.legGeometry?.points ?? ""; // Garantiza que sea un string
        if (!pointsString) return;

        const decodedPoints: LatLngTuple[] = polyline
          .decode(pointsString)
          .map(([lat, lon]: [number, number]) => [lat, lon] as LatLngTuple); // Convertir a LatLngTuple

        const isWalking = leg.mode === "WALK";
        const polylineLayer = L.polyline(decodedPoints, {
          color: isWalking ? "#1E90FF" : leg.route?.color ? `#${leg.route.color}` : "blue",
          weight: isWalking ? 3 : 5,
          opacity: 1,
          dashArray: isWalking ? "4 4" : undefined, // Cambiar null por undefined
        });
        polylineLayer.addTo(map);
      });

      // Centrar el mapa
      const bounds = routeData.legs
        .map((leg: any) => [
          [leg.from.lat, leg.from.lon] as LatLngTuple,
          [leg.to.lat, leg.to.lon] as LatLngTuple,
        ])
        .filter(
          ([from, to]: any) =>
            from && to && !isNaN(from[0]) && !isNaN(from[1]) && !isNaN(to[0]) && !isNaN(to[1])
        );

      if (bounds.length > 0) {
        map.fitBounds(bounds.flat() as LatLngTuple[]);
      }

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds());
      }
    }

    return () => {
      map.remove();
    };
  }, [routeData]);

  return <div id="map" className="w-full h-full" />;
};

export default MapX;
