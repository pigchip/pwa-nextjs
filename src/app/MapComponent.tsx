// src/app/MapComponent.tsx
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), { ssr: false });

interface MapComponentProps {
  startLocation: { lat: number, lon: number } | null;
  endLocation: { lat: number, lon: number } | null;
}

export default function MapComponent({ startLocation, endLocation }: MapComponentProps) {
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
      <Map startLocation={startLocation} endLocation={endLocation} />
    </div>
  );
}
