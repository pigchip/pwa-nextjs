import dynamic from 'next/dynamic';

interface MapComponentProps {
  startLocation: { lat: number; lon: number } | null;
  endLocation: { lat: number; lon: number } | null;
}

// Importa dinámicamente el componente combinado
const ItineraryMapComponent = dynamic(() => import('./ItineraryMapComponent'), { ssr: false });

export default function MapComponent({ startLocation, endLocation }: MapComponentProps) {
  return (
    <div className='flex-1 overflow-auto'>
      <ItineraryMapComponent startLocation={startLocation} endLocation={endLocation} />
    </div>
  );
}
