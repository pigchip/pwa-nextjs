"use client";

import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, Popup, Circle } from 'react-leaflet';
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

interface Incident {
  id: number;
  name: string;
  line: number | string;
  incident: string;
  services: string;
  information: string;
  lat: number;
  lon: number;
  agency: string;
  route: string;
}

interface InteractiveMapComponentProps {
  selectedRoutes: string[];
  displayedRoutes: Route[];
  handlePolylineClick: (route: Route) => void;
  handleMarkerClick: (stationInfo: any, stop: Stop, route: Route) => void;
  findStationInfo: (stopName: string, lat: number, lon: number, agencyName: string) => { station: any; line: any } | null;
  getStationLogo: (agencyName: string) => string;
  incidents: Incident[];
  showIncidents: boolean;
  lat: number;
  lon: number; 
}

// Componente para ícono de incidentes
const IncidentIcon = () =>
  new L.DivIcon({
    className: '',
    html:` <div class="bg-white text-red-500 text-2xl flex items-center justify-center rounded-full" style="width: 35px; height: 35px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);">
             <span class="material-icons" style="transform: translateY(-2px);">warning</span>
           </div>`,
    iconSize: [35, 35], // Icon size remains the same
    iconAnchor: [17.5, 17.5], // Center the icon
    popupAnchor: [1, -30], // Popup anchor remains the same
  });



const InteractiveMapComponent: React.FC<InteractiveMapComponentProps> = ({
  selectedRoutes,
  displayedRoutes,
  handlePolylineClick,
  handleMarkerClick,
  findStationInfo,
  getStationLogo,
  incidents,
  showIncidents,
  lat,
  lon,
}) => {
  return (
    <MapContainer center={lat !== 123 && lon !== 123 ? [lat, lon] : [19.432608, -99.133209]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
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

        {/* Dibujamos un círculo en las coordenadas proporcionadas */}
        {lat !== 123 && lon !== 123 && (
          <Circle
            center={[lat, lon]}
            radius={200}
            pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.5 }}
          />
        )}

        {/* Renderizar marcadores de incidentes si showIncidents es true */}
        {showIncidents &&
          incidents.map((incident) => {
            if (typeof incident.lat !== 'number' || typeof incident.lon !== 'number') {
              console.warn(
                `Incident ${incident.id} tiene coordenadas inválidas: (${incident.lat}, ${incident.lon})`
              );
              return null;
            }
            return (
              <Marker
                key={`incident-${incident.id}`}
                position={[incident.lat, incident.lon]}
                icon={IncidentIcon()}
              >
                <Popup>
                  <div className="incident-popup text-base font-sans" style={{ width: '200px' }}>
                    <strong className="font-semibold center">{incident.name}</strong>
                    <div className='text-sm'>
                      <strong>Agencia:</strong> {incident.agency}<br />
                      <strong>Línea/Ruta:</strong> {incident.route}<br />
                      <strong>Incidente:</strong> <br />{incident.incident}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

    </MapContainer>
  );
};

export default InteractiveMapComponent;
