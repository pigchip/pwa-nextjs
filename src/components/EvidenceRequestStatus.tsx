import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';

interface EvidenceRequestStatusProps {
  status: 'sent' | 'failed' | 'processing' | 'rejected';
}

const EvidenceRequestStatus: React.FC<EvidenceRequestStatusProps> = ({ status }) => {
  const renderStatusMessage = () => {
    switch (status) {
      case 'sent':
        return (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h2 className="text-lg font-semibold">Se ha enviado tu solicitud</h2>
            <p>Tu solicitud ha sido enviada exitosamente y está en proceso de revisión.</p>
          </div>
        );
      case 'failed':
        return (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="text-lg font-semibold">La solicitud ha fallado ):</h2>
            <p>Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo.</p>
            <p>Consulta el status de tu solicitud en el menú Evidencias</p>
            <div className="flex justify-around mt-4">
        <div className="flex items-center">
          <CheckCircleIcon className="text-green-500" />
          <span className="ml-2">Validado</span>
        </div>
        <div className="flex items-center">
          <HourglassEmptyIcon className="text-yellow-500" />
          <span className="ml-2">Sin validar</span>
        </div>
        <div className="flex items-center">
          <CancelIcon className="text-red-500" />
          <span className="ml-2">Rechazado</span>
        </div>
      </div>
          </div>
        );
      case 'processing':
        return (
          <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <h2 className="text-lg font-semibold">Tu solicitud está siendo procesada :)</h2>
            <p>Estamos revisando tu solicitud. Te notificaremos una vez que se complete el proceso.</p>
          </div>
        );
      case 'rejected':
        return (
          <div className="p-4 bg-gray-100 border border-gray-400 text-gray-700 rounded">
            <h2 className="text-lg font-semibold">Tu solicitud ha sido rechazada ):</h2>
            <p>Lamentablemente, tu solicitud no ha sido aprobada. Por favor, contacta con soporte para más información.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {renderStatusMessage()}
    </div>
  );
};

export default EvidenceRequestStatus;