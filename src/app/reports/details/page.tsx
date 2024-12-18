"use client";

import Layout from "@/components/Layout";
import { useReports } from "@/contexts/ReportsContext";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRole } from "@/contexts/RoleContext";
import { useState } from "react";
import { Status } from "@/types/register";
import ConfirmModal from "@/components/ConfirmModal";
import MapWithMarker from "@/components/MapWithMarker"; // Importa el componente del mapa
import { Knock } from "@knocklabs/node";
import { useLinesStations } from "@/stores/LinesStationsContext";
import sendKnockNotification, { recipients } from "@/utils/knock/sendNotification";

const EvidenceDetails: React.FC = () => {
  const { selectedReport, setSelectedReport, updateReport } = useReports();
  const router = useRouter();
  const { role } = useRole();
  const [newStatus, setNewStatus] = useState<Status | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { lines, stations, getFirstAndLastStations } = useLinesStations();

  const knockApiKey = process.env.NEXT_PUBLIC_KNOCK_SECRET_API_KEY;

  if (!knockApiKey) {
    throw new Error("NEXT_PUBLIC_KNOCK_SECRET_API_KEY is not defined");
  }

  const knockNode = new Knock(knockApiKey);

  const handleBack = () => {
    if (role === "supervisor" || role === "admin") {
      router.push("/supervisor");
    } else {
      router.push("/reports");
    }
    setSelectedReport(null);
  };

  const handleStatusChange = async () => {
    if (!newStatus || !selectedReport) return;

    if (newStatus === "Validado") {
      setIsModalOpen(true);
    } else {
      await updateStatus();
    }
  };

  const updateStatus = async () => {
    try {
      const response = await fetch(`/api/reports/update/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedReport?.id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const newReport = await fetch(`/api/reports/${selectedReport?.id}`);
      if (!newReport.ok) {
        throw new Error("Failed to fetch updated report");
      }

      const updatedReport = await newReport.json();
      setSelectedReport(updatedReport);
      updateReport(updatedReport);
      setNewStatus(null);

      if (newStatus === "Validado") {
        await updateStationIncident(updatedReport.station, updatedReport.body);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateStationIncident = async (stationId: number, incident: string) => {
    try {
      const response = await fetch(`/api/stations/update/incident`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: stationId, incident }),
      });

      if (!response.ok) {
        throw new Error("Failed to update station incident");
      }

      sendKnockNotification(recipients, {
        value: incident,
        station: stationId
      });
    } catch (error) {
      console.error("Error updating station incident:", error);
    }
  };

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    await updateStatus();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (!selectedReport) {
    return <div>Loading...</div>;
  }

  const { body, date, line: lineId, route, station: stationId, status, transport, time, x, y } = selectedReport;

  const line = lines.find(line => line.id === lineId);
  const station = stations.find(station => station.id === stationId);
  const { firstStation, lastStation } = getFirstAndLastStations(lineId);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 shadow-lg rounded-lg">
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-2">
            <ArrowBackIcon style={{ color: "#6ABDA6" }} />
          </button>
          <h1 className="text-3xl font-bold text-center flex-grow">
            Detalles de la Evidencia
          </h1>
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
            <span>{line?.name} de {firstStation?.name} a {lastStation?.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Ruta:</span>
            <span>{route}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Estación:</span>
            <span>{station?.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Estado:</span>
            <span>{status.toString()}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Coordenadas:</span>
            <span>{x}</span>
            <span>{y}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-semibold">Descripción:</span>
            <span>{body}</span>
          </div>

          {/* Mapa */}
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-2">Ubicación en el mapa</h2>
            <MapWithMarker lat={x} lon={y} />
          </div>

          {(role === "supervisor" || role === "admin") && (
            <div className="mt-6">
              <select
                value={newStatus || ""}
                onChange={(e) => setNewStatus(e.target.value as Status)}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Seleccionar nuevo estado
                </option>
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
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

      <ConfirmModal
        open={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </Layout>
  );
};

export default EvidenceDetails;