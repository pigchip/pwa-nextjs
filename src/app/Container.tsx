import { useState } from 'react';
import NavigationComponent from './NavigationComponent';
import SavedLocationsComponent from './SavedLocationsComponent';
import ReportsComponent from './ReportsComponent';
import SettingsComponent from './SettingsComponent';

type ActiveComponent = 'navigation' | 'search-history' | 'reports' | 'settings';

const Container: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('navigation');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'navigation':
        return <NavigationComponent />;
      case 'search-history':
        return <SavedLocationsComponent />;
      case 'reports':
        return <ReportsComponent />;
      case 'settings':
        return <SettingsComponent />;
      default:
        return <NavigationComponent />;
    }
  };

  return (
    <div className="flex flex-col h-[93vh] sm:h-screen overflow-hidden"> {/* Asegura que no se extienda más de la pantalla */}
      {/* Vista principal */}
      <div className="flex-grow overflow-y-auto"> {/* Solo el contenido principal puede desplazarse */}
        {renderComponent()}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between bg-gray-100 flex-shrink-0"> {/* Evita que los botones crezcan */}
        <div className="flex-1 relative">
          <button
            onClick={() => setActiveComponent('navigation')}
            className={`btn py-4 min-h-[60px] transition-colors w-full ${
              activeComponent === 'navigation' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
            }`}
          >
            <i className="material-icons mt-2">navigation</i>
          </button>
        </div>
        <div className="flex-1 relative">
          <button
            onClick={() => setActiveComponent('search-history')}
            className={`btn py-4 min-h-[60px] transition-colors w-full ${
              activeComponent === 'search-history' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
            }`}
          >
            <i className="material-icons mt-2">save</i>
          </button>
        </div>
        <div className="flex-1 relative">
          <button
            onClick={() => setActiveComponent('reports')}
            className={`btn py-4 min-h-[60px] transition-colors w-full ${
              activeComponent === 'reports' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
            }`}
          >
            <i className="material-icons mt-2">assignment</i>
          </button>
        </div>
        <div className="flex-1 relative">
          <button
            onClick={() => setActiveComponent('settings')}
            className={`btn py-4 min-h-[60px] transition-colors w-full ${
              activeComponent === 'settings' ? 'text-[#6ABDA6] border-t-4 border-[#6ABDA6]' : 'text-black'
            }`}
          >
            <i className="material-icons mt-2">settings</i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Container;
