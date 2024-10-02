import React from 'react';

interface EvidenceDetailsProps {
  userName: string;
  eventDuration: string;
  transport: string;
  line: string;
  station: string;
  incidentReasons: string;
  createdBy: string;
  creationDateTime: string;
  receptionDateTime: string;
}

const EvidenceDetails: React.FC<EvidenceDetailsProps> = ({
  userName,
  eventDuration,
  transport,
  line,
  station,
  incidentReasons,
  createdBy,
  creationDateTime,
  receptionDateTime,
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Detalles de la Evidencia</h1>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold">Nombre del usuario:</span>
          <span>{userName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Duración del evento:</span>
          <span>{eventDuration}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Transporte:</span>
          <span>{transport}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Línea:</span>
          <span>{line}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Estación:</span>
          <span>{station}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Razones del incidente:</span>
          <span>{incidentReasons}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Quién creó la evidencia:</span>
          <span>{createdBy}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Fecha y hora de la creación de la evidencia:</span>
          <span>{creationDateTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Fecha y hora de la recepción de la evidencia:</span>
          <span>{receptionDateTime}</span>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetails;