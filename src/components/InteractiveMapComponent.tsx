"use client";

import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define the types for your props
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

interface Agency {
  name: string;
}

interface Route {
  shortName: string;
  longName: string;
  color: string;
  agency: Agency;
  patterns: Pattern[];
}

interface InteractiveMapComponentProps {
  selectedRoutes: string[];
  displayedRoutes: Route[];
  handlePolylineClick: (route: Route) => void;
  handleMarkerClick: (stationInfo: any, stop: Stop, route: Route) => void;
  findStationInfo: (stopName: string, lat: number, lon: number, agencyName: string) => { station: any; line: any } | null;
  getStationLogo: (agencyName: string) => string;
}

const InteractiveMapComponent: React.FC<InteractiveMapComponentProps> = ({
  selectedRoutes,
  displayedRoutes,
  handlePolylineClick,
  handleMarkerClick,
  findStationInfo,
  getStationLogo,
}) => {
  return (
    <MapContainer center={[19.432608, -99.133209]} zoom={12} style={{ height: '64vh', width: '100vw', zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {selectedRoutes.length > 0 && displayedRoutes.map((route) =>
        route.patterns.map((pattern, patternIndex) => {
          const routePositions = pattern.geometry.map(
            (coord) => [coord.lat, coord.lon] as [number, number]
          );
          const stopPositions = pattern.stops;

          return (
            <React.Fragment key={`fragment-${route.shortName}-${patternIndex}`}>
              <Polyline
                positions={routePositions}
                pathOptions={{ color: `#${route.color}`, weight: 4 }}
                smoothFactor={0}
                eventHandlers={{
                  click: () => handlePolylineClick(route),
                }}
              />
              {stopPositions.map((stop, stopIdx) => {
                const stationInfo = findStationInfo(
                  stop.name,
                  stop.lat,
                  stop.lon,
                  route.agency.name
                );

                return (
                  <Marker
                    key={`marker-${route.shortName}-${patternIndex}-stop-${stopIdx}`}
                    position={[stop.lat, stop.lon]}
                    icon={L.icon({
                      iconUrl: getStationLogo(route.agency.name),
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                    eventHandlers={{
                      click: () => handleMarkerClick(stationInfo, stop, route),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      {`${route.shortName} - ${stop.name}`}
                    </Tooltip>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })
      )}
    </MapContainer>
  );
};

export default InteractiveMapComponent;
