"use client";

import Layout from "@/components/Layout";
import LineIncidents from "@/components/LineIncidents";
import StationIncidents from "@/components/StationIncidents";
import React, { useState, useEffect } from "react";

const IncidentsPage: React.FC = () => {
  const [view, setView] = useState<"line" | "station">("line");

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Incidentes</h1>
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 mx-2 ${
              view === "line" ? "bg-[#6ABDA6] text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("line")}
          >
            Incidentes en Líneas
          </button>
          <button
            className={`px-4 py-2 mx-2 ${
              view === "station" ? "bg-[#6ABDA6] text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("station")}
          >
            Incidentes en Estaciones
          </button>
        </div>
        {view === "line" ? <LineIncidents /> : <StationIncidents />}
      </div>
    </Layout>
  );
};

export default IncidentsPage;
