// FILE: components/StationDetails.tsx
import React from 'react';
import Image from 'next/image';
import { Station } from '@/types';

interface StationDetailsProps {
  station: Station | null;
  agency: string;
  getAgencyIcon: (agencyName: string) => string;
}

const StationDetails: React.FC<StationDetailsProps> = ({ station, agency, getAgencyIcon }) => {
  if (!station) return null;

  return (
    <>
      <Image src={getAgencyIcon(agency)} alt={agency} width={40} height={40} className="mb-2" />
      <p><strong>Nombre:</strong> {station.name}</p>
      <p><strong>Línea:</strong> {station.line}</p>
      <p><strong>Incidente:</strong> {station.incident || 'No hay incidentes reportados'}</p>
      <p><strong>Servicios:</strong> {station.services || 'No disponible'}</p>
      <p><strong>Información:</strong> {station.information || 'No disponible'}</p>

      {/* Transbordos de la Estación */}
      {station.transfers && station.transfers.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-4">Transbordos:</h3>
          <ul className="list-disc list-inside">
            {station.transfers.map(transfer => (
              <li key={transfer.id}>
                {transfer.name} - Línea {transfer.line}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Opiniones de la Estación */}
      {station.opinions && station.opinions.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-4">Opiniones:</h3>
          <ul className="list-disc list-inside">
            {station.opinions.map(opinion => (
              <li key={opinion.id} className="mt-2">
                <span><strong>{opinion.type}</strong> ({opinion.date} {opinion.time})</span>
                <p>{opinion.body}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default StationDetails;