import React, { useState } from 'react';

const ReportsComponent: React.FC = () => {

  return (
    <div className="flex flex-col h-full justify-between bg-gray-100">
      {/* Main Content */}
      <div className="flex flex-col items-start w-full pl-5">
        <h2 className="text-xl font-bold text-black">Evidencias</h2>
      </div>

      {/* Centered Text and Button */}
      <div className="flex flex-col flex-grow justify-center items-center text-center px-4">
        <span className='text-[#6C7976] text-lg'>
          Todo bien por aquí, no tienes ninguna evidencia aprobada :)
        </span>
        <button className="w-64 py-2 mt-4 bg-[#6ABDA6] text-white font-semibold rounded-lg">
          Solicitar Evidencia
        </button>
      </div>
    </div>
  );
};

export default ReportsComponent;
