import React, { useState, useEffect } from 'react';
import { Line } from '@/types/line';

const LineIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Line[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch('/api/lines/incidents');
        if (!response.ok) {
          throw new Error('Failed to fetch line incidents');
        }
        const data = await response.json();
        setIncidents(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Incidentes en líneas</h2>
      <ul className="space-y-4">
        {incidents.map((incident) => (
          <li key={incident.id} className="p-4 border rounded-lg shadow-md bg-white">
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold">{incident.name}</h3>
              <span className="ml-2 text-sm text-gray-500">({incident.transport})</span>
            </div>
            <p className="text-gray-700"><strong>Incident:</strong> {incident.incident}</p>
            <p className="text-gray-700"><strong>Speed:</strong> {incident.speed} km/h</p>
            <p className="text-gray-700"><strong>Information:</strong> {incident.information}</p>
            {incident.routes && incident.routes.length > 0 && (
              <div className="mt-2">
                <p className="text-gray-700"><strong>Routes:</strong></p>
                <ul className="list-disc list-inside">
                  {incident.routes.map((route) => (
                    <li key={route.id} className="text-gray-700">{route.name} - ${route.price}</li>
                  ))}
                </ul>
              </div>
            )}
            {incident.opinions && incident.opinions.length > 0 && (
              <div className="mt-2">
                <p className="text-gray-700"><strong>Opinions:</strong></p>
                <ul className="list-disc list-inside">
                  {incident.opinions.map((opinion) => (
                    <li key={opinion.id} className="text-gray-700">{opinion.body}</li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LineIncidents;