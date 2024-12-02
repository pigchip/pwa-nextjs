import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '@/components/Layout';
import StationDetails from '@/components/StationDetails';
import { Station } from '@/types';
import { getAgencyIcon } from '@/utils/agency';

const MostVisited: React.FC = () => {
  const [mostVisited, setMostVisited] = useState<{ lines: any[], stations: any[] }>({ lines: [], stations: [] });
  const router = useRouter();

  useEffect(() => {
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    console.log(savedRoutes);

    const lines = savedRoutes.flatMap((route: any) =>
      route.legs
        .filter((leg: any) => leg.mode !== 'WALK')
        .map((leg: any) => ({
          agency: leg.route?.agency?.name || 'Unknown',
          longName: leg.route?.longName || 'Unknown',
          shortName: leg.route?.shortName || 'Unknown'
        }))
    );

    const lineFrequency = lines.reduce((acc: any, line: any) => {
      const key = `${line.agency}-${line.longName}-${line.shortName}`;
      acc[key] = acc[key] || { ...line, frequency: 0 };
      acc[key].frequency += 1;
      return acc;
    }, {});

    const uniqueLines = Object.keys(lineFrequency).map(key => lineFrequency[key]);

    const stations = savedRoutes.flatMap((route: any) => 
      route.legs.map((leg: any) => ({
        name: leg.to.name,
        agency: leg.route && leg.route.agency ? leg.route.agency.name : 'Unknown'
      }))
    );

    const stationFrequency = stations.reduce((acc: any, station: any) => {
      acc[station.name] = acc[station.name] || { frequency: 0, agency: station.agency };
      acc[station.name].frequency += 1;
      return acc;
    }, {});

    const uniqueStations = Object.keys(stationFrequency).map(station => ({
      name: station,
      frequency: stationFrequency[station].frequency,
      agency: stationFrequency[station].agency
    }));

    setMostVisited({ lines: uniqueLines, stations: uniqueStations });
  }, []);

  const handleBackClick = () => {
    router.push('/settings');
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <button onClick={handleBackClick} className="mr-2">
            <ArrowBackIcon style={{ color: "#6ABDA6" }} />
          </button>
          <h2 className="text-2xl font-bold text-left">Líneas y Estaciones Más Visitadas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Estaciones</h3>
            {mostVisited.stations.length > 0 ? (
              <ul className="space-y-4">
                {mostVisited.stations.map((station, index) => (
                  <li key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <span>{station.name}</span>
                      <span className="text-sm text-gray-500">Frecuencia: {station.frequency}</span>
                    </div>
                    <StationDetails
                      station={station as Station}
                      agency={station.agency}
                      getAgencyIcon={getAgencyIcon}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay información disponible</p>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Líneas</h3>
            {mostVisited.lines.length > 0 ? (
              <ul className="space-y-4">
                {mostVisited.lines.map((line, index) => (
                  <li key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <span>{line.agency} {line.shortName}: {line.longName} </span>
                      <span className="text-sm text-gray-500">Frecuencia: {line.frequency}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay información disponible</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MostVisited;