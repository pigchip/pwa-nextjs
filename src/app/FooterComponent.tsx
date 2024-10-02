// src/components/FooterComponent.tsx

import React, { useContext } from 'react';
import NavigationIcon from '@mui/icons-material/Navigation';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AssigmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import { SelectedItineraryContext } from './contexts/SelectedItineraryContext';

const FooterComponent: React.FC = () => {
  const { activeComponent, setActiveComponent } = useContext(SelectedItineraryContext);

  return (
    <footer className="flex justify-between bg-gray-100 flex-shrink-0 w-full"> {/* Evita que los botones crezcan */}
      {/* Botón Navegación */}
      <div className="flex-1 relative">
        <button
          onClick={() => setActiveComponent('navigation')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${
            activeComponent === 'navigation' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
          }`}
          aria-label="Navegación"
        >
          <NavigationIcon className="mt-2" />
        </button>
      </div>

      {/* Botón Rutas Guardadas */}
      <div className="flex-1 relative">
        <button
          onClick={() => setActiveComponent('saved-routes')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${
            activeComponent === 'saved-routes' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
          }`}
          aria-label="Rutas Guardadas"
        >
          <BookmarkIcon className="mt-2" />
        </button>
      </div>

      {/* Botón Reportes */}
      <div className="flex-1 relative">
        <button
          onClick={() => setActiveComponent('reports')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${
            activeComponent === 'reports' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
          }`}
          aria-label="Reportes"
        >
          <AssigmentIcon className="mt-2" />
        </button>
      </div>

      {/* Botón Configuración */}
      <div className="flex-1 relative">
        <button
          onClick={() => setActiveComponent('settings')}
          className={`btn py-4 min-h-[60px] transition-colors w-full ${
            activeComponent === 'settings' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
          }`}
          aria-label="Configuración"
        >
          <SettingsIcon className="mt-2" />
        </button>
      </div>
    </footer>
  );
};

export default FooterComponent;
