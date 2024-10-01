"use client";

import React from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SubwayIcon from '@mui/icons-material/Subway';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const CreateEvidenceComponent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen justify-between p-4">
      <div>
        <h1 className="text-2xl font-bold text-left mb-6">Solicitar Evidencia</h1>
        
        <div className="flex flex-col items-center space-y-4">
          <Menu as="div" className="relative inline-block text-left w-64">
            <MenuButton className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2">
              <DirectionsBusIcon className="ml-2" />
              <span className="flex-grow text-left pl-2 text-gray-400">Medio de transporte</span>
              <ArrowDropDownIcon className="ml-auto mr-4" />
            </MenuButton>
            <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
              <MenuItem>
                {({ focus }) => (
                  <button className={`${
                    focus ? 'bg-gray-200' : ''
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                    Option 1
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button className={`${
                    focus ? 'bg-gray-200' : ''
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                    Option 2
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>

          <Menu as="div" className="relative inline-block text-left w-64">
            <MenuButton className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2">
              <SubwayIcon className="ml-2" />
              <span className="flex-grow text-left pl-2 text-gray-400">Línea</span>
              <ArrowDropDownIcon className="ml-auto mr-4" />
            </MenuButton>
            <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
              <MenuItem>
                {({ focus }) => (
                  <button className={`${
                    focus ? 'bg-gray-200' : ''
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                    Option 1
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button className={`${
                    focus ? 'bg-gray-200' : ''
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                    Option 2
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>

          <Menu as="div" className="relative inline-block text-left w-64">
            <MenuButton className="w-full py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg flex items-center space-x-2">
              <LocationOnIcon className="ml-2" />
              <span className="flex-grow text-left pl-2 text-gray-400">Estación</span>
              <ArrowDropDownIcon className="ml-auto mr-4" />
            </MenuButton>
            <MenuItems className="absolute mt-2 w-full bg-white shadow-lg rounded-md z-10">
              <MenuItem>
                {({ focus }) => (
                  <button className={`${
                    focus ? 'bg-gray-200' : ''
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                    Option 1
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button className={`${
                    focus ? 'bg-gray-200' : ''
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                    Option 2
                  </button>
                )}
              </MenuItem>
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
  );
};

export default CreateEvidenceComponent;