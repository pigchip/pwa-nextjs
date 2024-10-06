"use client";

import Layout from "@/components/Layout";
import { useReports } from "@/contexts/ReportsContext";
import { useRouter } from "next/navigation";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EvidenceDetails: React.FC = () => {
  const { selectedReport, setSelectedReport } = useReports();
  const router = useRouter();

  const handleBack = () => {
    router.push("/reports");
    setSelectedReport(null);
  };

  if (!selectedReport) {
    return <div>Loading...</div>;
  }

  const { body, date, line, route, station, status, transport, time } =
    selectedReport;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 shadow-lg rounded-lg">
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-2">
            <ArrowBackIcon style={{ color: '#6ABDA6' }} />
          </button>
          <h1 className="text-3xl font-bold text-center flex-grow">Detalles de la Evidencia</h1>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Fecha:</span>
            <span>{date}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Hora:</span>
            <span>{time}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Transporte:</span>
            <span>{transport}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Línea:</span>
            <span>{line}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Ruta:</span>
            <span>{route}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Estación:</span>
            <span>{station}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Estado:</span>
            <span>{status.toString()}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Descripción:</span>
            <span>{body}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EvidenceDetails;