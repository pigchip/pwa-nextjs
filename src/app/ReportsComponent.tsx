import React from 'react';

const ReportsComponent: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-between bg-gray-100">
      {/* Main Content */}
      <div className="flex flex-col items-start space-y-6 w-full pl-4 mt-4">
        <div className="flex flex-col items-start space-y-2 w-full">
          <span className="material-icons text-[#6ABDA6]">account_circle</span>
          <h2 className="text-xl font-bold text-black">Justificantes</h2>
        </div>
      </div>

      {/* Centered Text and Button */}
      <div className="flex flex-col flex-grow justify-center items-center text-center px-4">
        <span className='text-[#6C7976] text-lg'>
          Todo bien por aquí, no tienes ningún justificante aprobado :)
        </span>
        <button className="w-64 py-2 mt-4 bg-[#6ABDA6] text-white font-semibold rounded-lg">
          Solicitar Justificante
        </button>
      </div>
    </div>
  );
};

export default ReportsComponent;
