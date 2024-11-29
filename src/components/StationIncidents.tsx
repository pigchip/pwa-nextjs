// src/app/station-incidents/page.tsx
import React, { useState, useEffect } from "react";
import { fetchIncidents } from "@/lib/fetchIncidents";
import { Incident } from "@/types/incident";
import { getTransportByLineId } from "@/utils/getTransportByLineId";

const StationIncidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
        setFilteredIncidents(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredIncidents(
      incidents.filter((incident) => 
        incident.name.toLowerCase().includes(search.toLowerCase())
    ));
    setCurrentPage(1); // Reset to first page on search
  }, [search, incidents]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredIncidents.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredIncidents.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Cargando...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Incidentes en estaciones
      </h2>
      <input
        type="text"
        placeholder="Buscar por nombre de estación..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      {currentRecords.length === 0 ? (
        <p className="text-center text-gray-500">
          No se encontraron resultados.
        </p>
      ) : (
        <ul className="space-y-4">
          {currentRecords.map((incident) => {
            const transport = getTransportByLineId(incident.line);
            return (
              <li
                key={incident.id}
                className="p-4 border rounded-lg shadow-md bg-white"
              >
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-semibold">{incident.name}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    - Línea: {incident.line} del {transport.transport}
                  </span>
                </div>
                <p className="text-gray-700">
                  <strong>Incidente:</strong> {incident.incident}
                </p>
                <p className="text-gray-700">
                  <strong>Servicios:</strong> {incident.services}
                </p>
                <p className="text-gray-700">
                  <strong>Información:</strong> {incident.information}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 ? "bg-gray-300" : "bg-[#6ABDA6] text-white"
          }`}
        >
          Anterior
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-300"
              : "bg-[#6ABDA6] text-white"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default StationIncidents;