import Layout from '@/components/Layout';
import React, { useState } from 'react';

const SavedLocationsComponent: React.FC = () => {
  return (
    <Layout>
    <div className="flex flex-col h-full justify-between bg-gray-100">
      {/* Main Content */}
      <div className="flex flex-col items-start w-full pl-5">
        <h2 className="text-xl font-bold text-black">Rutas guardadas</h2>
      </div>

      {/* Centered Text and Button */}
      <div className="flex flex-col flex-grow justify-center items-center text-center px-4">
        <span className='text-[#6C7976] text-lg'>
          No tienes aún ninguna ruta :(
        </span>
        <button className="w-64 py-2 mt-4 bg-[#6ABDA6] text-white font-semibold rounded-lg">
          Añadir Ruta
        </button>
      </div>
    </div>
    </Layout>
  );
};

export default SavedLocationsComponent;
