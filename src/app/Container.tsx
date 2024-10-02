import React, { useState, useEffect } from 'react';
import NavigationComponent from './NavigationComponent';
import ReportsComponent from './ReportsComponent';
import SettingsComponent from './SettingsComponent';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';
import { SelectedItineraryProvider, SelectedItineraryContext } from './contexts/SelectedItineraryContext';
import SavedRoutesComponent from './SavedRoutesComponent';

const Container: React.FC = () => {
  const [startPlaceholder, setStartPlaceholder] = useState<string>('');
  const [endPlaceholder, setEndPlaceholder] = useState<string>('');

  useEffect(() => {
    // Cargar valores guardados de localStorage al cargar el componente
    const savedStart = localStorage.getItem('savedStartLocation');
    const savedEnd = localStorage.getItem('savedEndLocation');
    if (savedStart) setStartPlaceholder(JSON.parse(savedStart).name || '');
    if (savedEnd) setEndPlaceholder(JSON.parse(savedEnd).name || '');
  }, []);

  return (
    <SelectedItineraryProvider>
      <ContainerContent startPlaceholder={startPlaceholder} endPlaceholder={endPlaceholder} />
    </SelectedItineraryProvider>
  );
};

const ContainerContent: React.FC<{ startPlaceholder: string; endPlaceholder: string }> = ({ startPlaceholder, endPlaceholder }) => {
  const { activeComponent } = React.useContext(SelectedItineraryContext);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'navigation':
        return <NavigationComponent />;
      case 'saved-routes':
        return <SavedRoutesComponent />;
      case 'reports':
        return <ReportsComponent />;
      case 'settings':
        return <SettingsComponent />;
      default:
        return <NavigationComponent />;
    }
  };

  return (
    <div className="flex flex-col h-[93vh] sm:h-screen overflow-hidden">
      {/* Header con altura fija */}
      <div className="flex-none h-16 bg-gray-200">
        <HeaderComponent />
      </div>

      {/* Vista principal que ocupa el espacio restante y ajusta el contenido */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full bg-[#f3f4f5]">
          {renderComponent()}
        </div>
      </div>

      {/* Footer con altura fija */}
      <div className="flex-none h-16 bg-gray-200">
        <FooterComponent />
      </div>
    </div>
  );
};

export default Container;
