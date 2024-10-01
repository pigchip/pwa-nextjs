import React, { useState } from 'react';
import NavigationComponent from './NavigationComponent';
import SavedLocationsComponent from './SavedLocationsComponent';
import ReportsComponent from './ReportsComponent';
import SettingsComponent from './SettingsComponent';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

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
      
      {/* Header con altura fija */}
      <div className="flex-none h-16 bg-gray-200">
        <HeaderComponent />
      </div>

      {/* Vista principal que ocupa el espacio restante y ajusta el contenido */}
      <div className="flex-1 overflow-y-auto"> {/* Permite el scroll solo si el contenido se desborda */}
        <div className="h-full">
          {renderComponent()}
        </div>
      </div>

      {/* Footer con altura fija */}
      <div className="flex-none h-16 bg-gray-200">
        <FooterComponent 
          activeComponent={activeComponent} 
          setActiveComponent={setActiveComponent} 
        />
      </div>

    </div>
  );
};

export default Container;
