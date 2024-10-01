// Container.tsx
import React, { useState } from 'react';
import NavigationComponent from './NavigationComponent';
import SavedLocationsComponent from './SavedLocationsComponent';
import ReportsComponent from './ReportsComponent';
import SettingsComponent from './SettingsComponent';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent'; // Importa el FooterComponent

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
      <div className="flex-1 overflow-auto">
        {renderComponent()}
      </div>

      {/* Footer con botones de navegación */}
      <div className="flex-none">
        <FooterComponent 
          activeComponent={activeComponent} 
          setActiveComponent={setActiveComponent} 
        />
      </div>
      
    </div>
  );
};

export default Container;
