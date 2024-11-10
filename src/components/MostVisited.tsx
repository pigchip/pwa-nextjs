// FILE: components/MostVisited.tsx
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

const MostVisited: React.FC = () => {
  const [mostVisited, setMostVisited] = useState<{ lines: any[], stations: any[] }>({ lines: [], stations: [] });

  useEffect(() => {
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    const lines = savedRoutes.filter((route: any) => route.type === 'line');
    const stations = savedRoutes.flatMap((route: any) => 
      route.legs.map((leg: any) => leg.to.name)
    );

    const stationFrequency = stations.reduce((acc: any, station: string) => {
      acc[station] = (acc[station] || 0) + 1;
      return acc;
    }, {});

    const uniqueStations = Object.keys(stationFrequency).map(station => ({
      name: station,
      frequency: stationFrequency[station]
    }));

    setMostVisited({ lines, stations: uniqueStations });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Líneas y Estaciones Más Visitadas</h2>
        <div>
          <h3 className="text-lg font-semibold">Líneas</h3>
          <ul>
            {mostVisited.lines.map((line, index) => (
              <li key={index}>{line.startNameIti} - {line.endNameIti} (Frecuencia: {line.frequency})</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Estaciones</h3>
          <ul>
            {mostVisited.stations.map((station, index) => (
              <li key={index}>{station.name} (Frecuencia: {station.frequency})</li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default MostVisited;