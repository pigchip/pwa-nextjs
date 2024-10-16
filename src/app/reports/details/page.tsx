"use client";

import Layout from "@/components/Layout";
import { useReports } from "@/contexts/ReportsContext";
import { useRouter } from "next/navigation";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRole } from "@/contexts/RoleContext";
import { useState } from "react";
import { Status } from "@/types/register";

const EvidenceDetails: React.FC = () => {
  const { selectedReport, setSelectedReport, updateReport } = useReports();
  const router = useRouter();
  const { role } = useRole();
  const [newStatus, setNewStatus] = useState<Status | null>(null);

  const handleBack = () => {
    if (role === 'supervisor') {
      router.push("/supervisor");
    } else {
      router.push("/reports");
    }
    setSelectedReport(null);
  };

  const handleStatusChange = async () => {
    if (!newStatus || !selectedReport) return;

    try {
      const response = await fetch(`/api/reports/update/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedReport.id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const newReport = await fetch(`/api/reports/${selectedReport.id}`);
      if (!newReport.ok) {
        throw new Error('Failed to fetch updated report');
      }

      const updatedReport = await newReport.json();
      setSelectedReport(updatedReport);
      updateReport(updatedReport); // Add this line
      setNewStatus(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (!selectedReport) {
    return <div>Loading...</div>;
  }

  const { body, date, line, route, station, status, transport, time } = selectedReport;

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
          {role === 'supervisor' && (
            <div className="mt-6">
              <select
                value={newStatus || ''}
                onChange={(e) => setNewStatus(e.target.value as Status)}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="" disabled>Seleccionar nuevo estado</option>
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                onClick={handleStatusChange}
                className="ml-2 p-2 bg-[#6ABDA6] text-white rounded"
              >
                Actualizar Estado
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EvidenceDetails;