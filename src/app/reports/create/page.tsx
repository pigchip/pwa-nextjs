// pages/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { Transport, Line, Station, Register, Status } from "@/types";
import { useTransportLinesStore } from "@/stores/useTransportLinesStore";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import SubwayIcon from "@mui/icons-material/Subway";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { getMexicoCityDateTime } from "@/utils/date";
import { incidents } from "@/utils/incidents";
import { useLineStationsStore } from "@/stores/useLineStations";
import { TransportName } from "@/types/transport";

const CreateEvidenceComponent: React.FC = () => {
  const router = useRouter();
  const [transports, setTransports] = useState<Transport[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(
    null
  );
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);
  const [stationsDisabled, setStationsDisabled] = useState<boolean>(false);

  const { lines, fetchTransportLines } = useTransportLinesStore();
  const { lineStations, fetchStationsForLine } = useLineStationsStore();

  useEffect(() => {
    fetch("/api/transports")
      .then((response) => response.json())
      .then((data) => setTransports(data))
      .catch((error) => console.error("Error fetching transports:", error));
  }, []);

  useEffect(() => {
    if (lines.length > 0) {
      lines.forEach((line) => fetchStationsForLine(line.id));
    }
  }, [lines, fetchStationsForLine]);

  const handleTransportSelect = async (transportName: string) => {
    setSelectedTransport(transportName);
    setSelectedLine(null);
    setSelectedStation(null);
    setStationsDisabled(
      [
        "Red de Transporte de Pasajeros, Servicio Ordinario",
        "Red de Transporte de Pasajeros, Servicio Expreso",
        "Red de Transporte de Pasajeros, Servicio Nochebús",
        "Trolebús",
        "Trolebús Elevado",
        "Nochebús",
      ].includes(transportName)
    );

    await fetchTransportLines(transportName as TransportName);
  };

  const handleLineSelect = async (line: Line) => {
    setSelectedLine(line);
    setSelectedStation(null);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleSubmit = async () => {
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        throw new Error("Email not found in localStorage");
      }

      const userResponse = await fetch(`/api/userByEmail/${email}`);
      const userData = await userResponse.json();
      const userId = userData.id;

      const routeResponse = await fetch(
        `/api/lines/${selectedLine?.id}/routes`
      );
      const routeData = await routeResponse.json();
      const routeId = routeData[0]?.id;

      const { date, time } = getMexicoCityDateTime();

      const report: Register = {
        id: 0, // Assuming the ID will be generated by the backend
        user: userId,
        transport: selectedTransport!,
        line: selectedLine!.id,
        route: routeId,
        station: stationsDisabled ? 0 : selectedStation!.id,
        date,
        time,
        body: selectedIncident!.description,
        status: Status.SinValidar,
        x: "0", // Assuming default values for x and y
        y: "0",
      };

      const response = await fetch("/api/reports/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error("Failed to create report");
      }

      const data = await response.json();
      console.log("Report created successfully:", data);
      // Clean up the form
      cleanUpForm();
      router.push("/reports/status");
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const cleanUpForm = () => {
    setSelectedTransport(null);
    setSelectedLine(null);
    setSelectedStation(null);
    setSelectedIncident(null);
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-screen justify-between p-4">
        <div className="flex items-center mb-6">
          <button onClick={handleBackClick} className="mr-2">
            <ArrowBackIcon style={{ color: "#6ABDA6" }} />
          </button>
          <h1 className="text-2xl font-bold text-left">Solicitar Evidencia</h1>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Menu as="div" className="relative inline-block text-left w-64">
            <MenuButton className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2 text-left">
              <DirectionsBusIcon className="ml-2" />
              <span className="flex-grow text-left pl-2 text-gray-400">
                {selectedTransport ? selectedTransport : "Medio de transporte"}
              </span>
              <ArrowDropDownIcon className="ml-auto mr-4" />
            </MenuButton>
            <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
              {Array.isArray(transports) &&
                transports.map((transport, index) => (
                  <MenuItem key={index}>
                    {({ focus }) => (
                      <button
                        className={`${
                          focus ? "bg-gray-200" : ""
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm text-left`}
                        onClick={() => handleTransportSelect(transport.name)}
                      >
                        {transport.name}
                      </button>
                    )}
                  </MenuItem>
                ))}
            </MenuItems>
          </Menu>

          <Menu as="div" className="relative inline-block text-left w-64">
            <MenuButton className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2 text-left">
              <SubwayIcon className="ml-2" />
              <span className="flex-grow text-left pl-2 text-gray-400">
                {selectedLine ? selectedLine.name : "Línea"}
              </span>
              <ArrowDropDownIcon className="ml-auto mr-4" />
            </MenuButton>
            <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
              {lines.map((line, index) => (
                <MenuItem key={index}>
                  {({ focus }) => (
                    <button
                      className={`${
                        focus ? "bg-gray-200" : ""
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm text-left`}
                      onClick={() => handleLineSelect(line)}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-gray-900 text-left">
                          {line.name}
                          {lineStations[line.id] &&
                            lineStations[line.id].length > 0 && (
                              <span className="text-xs text-gray-500 ml-2 text-left">
                                ({lineStations[line.id][0].name} -{" "}
                                {
                                  lineStations[line.id][
                                    lineStations[line.id].length - 1
                                  ].name
                                }
                                )
                              </span>
                            )}
                        </span>
                      </div>
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

          <Menu as="div" className="relative inline-block text-left w-64">
            <MenuButton
              className={`w-full py-2 ${
                stationsDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-800"
              } font-semibold rounded-lg flex items-center space-x-2`}
              disabled={stationsDisabled}
            >
              <LocationOnIcon className="ml-2" />
              <span className="flex-grow text-left pl-2 text-gray-400">
                {selectedStation ? selectedStation.name : "Estación"}
              </span>
              <ArrowDropDownIcon className="ml-auto mr-4" />
            </MenuButton>
            <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
              {selectedLine &&
                lineStations[selectedLine.id]?.map((station, index) => (
                  <MenuItem key={index}>
                    {({ focus }) => (
                      <button
                        className={`${
                          focus ? "bg-gray-200" : ""
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                        onClick={() => setSelectedStation(station)}
                      >
                        {station.name}
                      </button>
                    )}
                  </MenuItem>
                ))}
            </MenuItems>
          </Menu>

          <Menu as="div" className="relative inline-block text-left w-64">
            <MenuButton className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2">
              <ReportProblemIcon className="ml-2" />
              <span className="flex-grow text-left pl-2 text-gray-400">
                {selectedIncident ? selectedIncident.name : "Incidente"}
              </span>
              <ArrowDropDownIcon className="ml-auto mr-4" />
            </MenuButton>
            <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
              {incidents.map((incident, index) => (
                <MenuItem key={index}>
                  {({ focus }) => (
                    <button
                      className={`${
                        focus ? "bg-gray-200" : ""
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      onClick={() => setSelectedIncident(incident)}
                      title={incident.description}
                    >
                      {incident.name}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            className="w-64 py-2 bg-[#6ABDA6] text-white font-semibold rounded-lg mb-32"
          >
            Solicitar
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEvidenceComponent;
