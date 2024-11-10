import React, { useState, useEffect } from 'react';
import { Station } from '@/types/station';

const StationIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Station[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch('/api/stations/incidents');
        if (!response.ok) {
          throw new Error('Failed to fetch station incidents');
        }
        const data = await response.json();
        setIncidents(data);
        setFilteredIncidents(data);
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

  useEffect(() => {
    setFilteredIncidents(
      incidents.filter((incident) =>
        incident.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, incidents]);

  if (loading) {
    return <p className="text-center text-gray-500">Cargando...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Incidentes en estaciones</h2>
      <input
        type="text"
        placeholder="Buscar por nombre de estación..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      {filteredIncidents.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron resultados.</p>
      ) : (
        <ul className="space-y-4">
          {filteredIncidents.map((incident) => (
            <li key={incident.id} className="p-4 border rounded-lg shadow-md bg-white">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-semibold">{incident.name}</h3>
                <span className="ml-2 text-sm text-gray-500">({incident.transport})</span>
              </div>
              <p className="text-gray-700"><strong>Incidente:</strong> {incident.incident}</p>
              <p className="text-gray-700"><strong>Servicios:</strong> {incident.services}</p>
              <p className="text-gray-700"><strong>Información:</strong> {incident.information}</p>
              {incident.transfers && incident.transfers.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-700"><strong>Transbordos:</strong></p>
                  <ul className="list-disc list-inside">
                    {incident.transfers.map((transfer) => (
                      <li key={transfer.id} className="text-gray-700">{transfer.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {incident.opinions && incident.opinions.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-700"><strong>Opiniones:</strong></p>
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
      )}
    </div>
  );
};

export default StationIncidents;