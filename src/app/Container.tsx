import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { SelectedItineraryProvider, SelectedItineraryContext } from './contexts/SelectedItineraryContext';

// Import components dynamically with SSR disabled
const NavigationComponent = dynamic(() => import('./NavigationComponent'), { ssr: false });
const ReportsComponent = dynamic(() => import('./ReportsComponent'), { ssr: false });
const SettingsComponent = dynamic(() => import('./SettingsComponent'), { ssr: false });
const HeaderComponent = dynamic(() => import('./HeaderComponent'), { ssr: false });
const FooterComponent = dynamic(() => import('./FooterComponent'), { ssr: false });
const SavedRoutesComponent = dynamic(() => import('./SavedRoutesComponent'), { ssr: false });

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
  const { activeComponent } = useContext(SelectedItineraryContext);

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
