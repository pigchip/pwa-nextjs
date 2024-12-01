import React, { useEffect, useState } from 'react';
import { getMostFrequentedRoutes } from '@/utils/route';

const MostFrequentedRoutes: React.FC = () => {
  const [frequentedRoutes, setFrequentedRoutes] = useState<any[]>([]);

  useEffect(() => {
    const routes = getMostFrequentedRoutes();
    console.log('routes', routes);
    const validRoutes = routes.filter((route: any) => route && route.startNameIti && route.endNameIti);
    setFrequentedRoutes(validRoutes);
  }, []);

  return (
    <div className="flex flex-col h-full justify-start bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-start w-full mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Rutas Más Frecuentadas
        </h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {frequentedRoutes.length === 0 ? (
          <p className="text-gray-500">No hay rutas guardadas.</p>
        ) : (
          <ul className="space-y-6">
            {frequentedRoutes.map((itinerary, index) => (
              <li
                key={index}
                className="bg-green-50 p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="w-full md:w-2/3 space-y-2 mb-4 md:mb-0">
                    <p className="text-lg font-semibold text-gray-700">
                      Ruta {index + 1}
                    </p>
                    <p className="text-gray-600">
                      Inicio:{" "}
                      <span className="font-medium">
                        {itinerary.startNameIti}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Destino:{" "}
                      <span className="font-medium">
                        {itinerary.endNameIti}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Frecuencia:{" "}
                      <span className="font-medium">
                        {itinerary.frequency || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MostFrequentedRoutes;