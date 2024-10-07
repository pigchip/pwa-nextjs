import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { SelectedItineraryProvider } from '@/contexts/SelectedItineraryContext';

// Import components dynamically with SSR disabled
const HeaderComponent = dynamic(() => import('./HeaderComponent'), { ssr: false });
const FooterComponent = dynamic(() => import('./FooterComponent'), { ssr: false });

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

  return (
    <div className="flex flex-col h-[93vh] sm:h-screen overflow-hidden">
      {/* Header con altura fija */}
      <div className="flex-none h-18 bg-gray-200">
        <HeaderComponent />
      </div>

      {/* Vista principal que ocupa el espacio restante y ajusta el contenido */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full bg-[#f3f4f5]">
        </div>
      </div>
      <div className="flex-none h-16 bg-gray-200">
        <FooterComponent />
      </div>
    </div>
  );
};

export default Container;