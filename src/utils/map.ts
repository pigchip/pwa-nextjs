import { NullableLocation, NullableUserLocation } from '@/types/map';
import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const createStartIcon = () => {
  const iconHTML = `
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
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    ">
      <div style="
        width: 20px;
        height: 20px;
        background-color: #00bcd4;
        border-radius: 50%;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHTML,
    className: '',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });
};

export const createEndIcon = () => {
  const iconHTML = `
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
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    ">
      <div style="
        width: 20px;
        height: 20px;
        background-color: #ff5722;
        border-radius: 50%;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHTML,
    className: '',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });
};

export const MapView = ({ startLocation, endLocation, userLocation }: { startLocation?: NullableLocation; endLocation?: NullableLocation; userLocation?: NullableUserLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (startLocation) {
      map.setView([startLocation.lat, startLocation.lon], 13);
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lon], 13);
    } else {
      map.setView([19.432608, -99.133209], 13);
    }
  }, [startLocation, endLocation, userLocation, map]);

  return null;
};