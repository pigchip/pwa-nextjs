"use client";

import React, { useEffect, useState } from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useRouter } from "next/navigation";
import { Register, Status } from "@/types/register";

import { useReports } from "@/contexts/ReportsContext";

const getStatusIcon = (status: Status) => {
  switch (status) {
    case Status.SinValidar:
      return <ErrorOutlineIcon className="text-yellow-500" />;
    case Status.EnProceso:
      return <HourglassEmptyIcon className="text-blue-500" />;
    case Status.Validado:
      return <CheckCircleIcon className="text-green-500" />;
    case Status.Rechazado:
      return <CancelIcon className="text-red-500" />;
    default:
      return <HourglassEmptyIcon className="text-blue-500" />;
  }
};

interface EvidenceHistoryProps {
  reports: Register[];
}

const EvidenceHistory: React.FC<EvidenceHistoryProps> = ({ reports }) => {
  const { selectedReport, setSelectedReport } = useReports();
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const [swipeEnd, setSwipeEnd] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const router = useRouter();

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    setSwipeStart(e.touches[0].clientX);
    setDeleteIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStart !== null) {
      setSwipeEnd(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (swipeStart !== null && swipeEnd !== null && deleteIndex !== null) {
      const swipeDistance = swipeStart - swipeEnd;
      if (swipeDistance > 100) {
        // Perform delete action
        console.log(`Delete item at index: ${deleteIndex}`);
        // Reset state
        setSwipeStart(null);
        setSwipeEnd(null);
        setDeleteIndex(null);
      } else {
        // Reset state if swipe distance is not enough
        setSwipeStart(null);
        setSwipeEnd(null);
        setDeleteIndex(null);
      }
    }
  };

  const handleRequestEvidence = () => {
    router.push("/reports/create");
  };

  const handleSelectReport = (report: Register) => {
    setSelectedReport(report);
    router.push("/reports/details");
  };

  useEffect(() => {
    if(selectedReport) {
      router.push("/reports/details");
    }
  });

  return (
    <div className="max-w-md mx-auto p-4">
      <>
        <p className="mb-6">
          Pulsa <AssignmentIcon className="inline-block" /> para consultar
          alguna evidencia.
        </p>
        {reports.map((report, index) => (
          <div
            key={index}
            className="relative flex items-center justify-between p-4 mb-4 border rounded shadow hover:shadow-lg cursor-pointer"
            onTouchStart={(e) => handleTouchStart(index, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => handleSelectReport(report)}
          >
            <div className="flex items-center">
              <AssignmentIcon className="text-blue-500" />
              <span className="ml-2">Evidencia - Incidente {index + 1}</span>
            </div>
            <div>
              {getStatusIcon(report.status)}
            </div>
            {deleteIndex === index &&
              swipeEnd !== null &&
              swipeStart !== null &&
              swipeStart - swipeEnd > 100 && (
                <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-16 bg-red-500 text-white">
                  Delete
                </div>
              )}
          </div>
        ))}
        <button
          onClick={handleRequestEvidence}
          className="w-full py-2 mt-6 text-white bg-[#6ABDA6] rounded hover:bg-[#5FAD9A] font-semibold"
        >
          Solicitar Evidencia
        </button>
      </>
    </div>
  );
};

export default EvidenceHistory;