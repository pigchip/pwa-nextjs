"use client";

import React, { useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SubwayIcon from '@mui/icons-material/Subway';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Layout from '@/components/Layout';
import { Transport } from '@/types/transport';
import { Line } from '@/types/line';
import { Station } from '@/types/station';

const CreateEvidenceComponent: React.FC = () => {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    fetch('/api/transports')
      .then(response => response.json())
      .then(data => setTransports(data))
      .catch(error => console.error('Error fetching transports:', error));
  }, []);
  
  useEffect(() => {
    const fetchLines = () => {
      if (selectedTransport) {
        fetch('/api/lines', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(data => {
            const filteredLines = data.filter((line: Line) => line.transport === selectedTransport);
            setLines(filteredLines);
          })
          .catch(error => console.error('Error fetching lines:', error));
      }
    };
  
    fetchLines();
  }, [selectedTransport]);

  useEffect(() => {
    const fetchStations = () => {
      if (selectedLine && stations.length === 0) {
        fetch(`/api/lines/${selectedLine.id}/stations`)
          .then(response => response.json())
          .then(data => setStations(data))
          .catch(error => console.error('Error fetching stations:', error));
      }
    };

    fetchStations();
  }, [selectedLine, stations.length]);

  const handleTransportSelect = (transportName: string) => {
    setSelectedTransport(transportName);
    setSelectedLine(null);
    setSelectedStation(null);
    setLines([]);
    setStations([]);
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-screen justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold text-left mb-6">Solicitar Evidencia</h1>
          
          <div className="flex flex-col items-center space-y-4">
            <Menu as="div" className="relative inline-block text-left w-64">
              <MenuButton className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2">
                <DirectionsBusIcon className="ml-2" />
                <span className="flex-grow text-left pl-2 text-gray-400">
                  {selectedTransport ? selectedTransport : 'Medio de transporte'}
                </span>
                <ArrowDropDownIcon className="ml-auto mr-4" />
              </MenuButton>
              <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
                {Array.isArray(transports) && transports.map((transport, index) => (
                  <MenuItem key={index}>
                    {({ focus }) => (
                      <button
                        className={`${
                          focus ? 'bg-gray-200' : ''
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
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
              <MenuButton
                className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2"
              >
                <SubwayIcon className="ml-2" />
                <span className="flex-grow text-left pl-2 text-gray-400">
                  {selectedLine ? selectedLine.name : 'Línea'}
                </span>
                <ArrowDropDownIcon className="ml-auto mr-4" />
              </MenuButton>
              <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
                {lines.map((line, index) => (
                  <MenuItem key={index}>
                    {({ focus }) => (
                      <button
                        className={`${
                          focus ? 'bg-gray-200' : ''
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                        onClick={() => setSelectedLine(line)}
                      >
                        {line.name}
                      </button>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>

            <Menu as="div" className="relative inline-block text-left w-64">
              <MenuButton
                className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2"
              >
                <LocationOnIcon className="ml-2" />
                <span className="flex-grow text-left pl-2 text-gray-400">{selectedStation ? selectedStation.name : 'Estación'}</span>
                <ArrowDropDownIcon className="ml-auto mr-4" />
              </MenuButton>
              <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
                {stations.map((station, index) => (
                  <MenuItem key={index}>
                    {({ focus }) => (
                      <button
                        className={`${
                          focus ? 'bg-gray-200' : ''
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

            <button className="w-64 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2">
              <ReportProblemIcon className="ml-2" />
              <span className="flex-grow text-left pl-2 text-gray-400">Incidente</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button className="w-64 py-2 bg-[#6ABDA6] text-white font-semibold rounded-lg mb-32">
            Solicitar
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEvidenceComponent;