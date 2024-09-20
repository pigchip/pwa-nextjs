import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDebounce } from './useDebounce'; // Importa el hook de debounce
import { ArrowForwardIos } from '@mui/icons-material';

interface AutoCompleteProps {
  placeholder: string;
  onSelect: (location: { lat: number, lon: number, display_name: string } | null) => void;
}

export default function AutoComplete({ placeholder, onSelect }: AutoCompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ lat: number, lon: number, display_name: string, place_id: number }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false); // Nueva bandera para controlar si estamos seleccionando una opción
  
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length < 3 || isSelecting) {
      setResults([]);
      setIsOpen(false);
      return;
    }
  
    const searchLocations = async () => {
      try {
        const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: debouncedQuery,
            format: 'json',
            addressdetails: 1,
            limit: 5,
            countrycodes: 'MX', // Limita la búsqueda a México
          },
        });
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setIsOpen(false);
      }
    };
  
    searchLocations();
  }, [debouncedQuery, isSelecting]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelecting(false); // Si el usuario está escribiendo, no estamos seleccionando una opción
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Si la entrada está vacía, pasamos null a onSelect
    if (newQuery === '') {
      onSelect(null);
    }
  };

  const handleSelect = (location: { lat: number, lon: number, display_name: string }) => {
    setIsSelecting(true); // Marcamos que estamos seleccionando una opción
    setQuery(location.display_name); // Actualizamos el campo con la selección
    setResults([]);
    setIsOpen(false); // Cierra el menú después de seleccionar una opción
    onSelect(location);

    // Quitamos el foco del input después de seleccionar una opción
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleFocus = () => {
    if (results.length > 0) {
      setIsOpen(true); // Solo abre el menú si hay resultados
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false); // Cierra el menú después de perder el foco
    }, 100);
  };

  const inputStyle = placeholder === "Mi Ubicación"
  ? "bg-[#dadada] placeholder-black text-black p-2 rounded-xl w-full shadow-xl"
  : "bg-[#6ABDA6] placeholder-black opacity-70 text-black p-2 rounded-xl w-full shadow-xl";

  return (
    <div style={{ position: 'relative' }}>
<div className="relative w-full flex items-center">
  <input
    type="text"
    value={query}
    onChange={handleChange}
    placeholder={placeholder}
    className={inputStyle}
    onFocus={handleFocus}
    onBlur={handleBlur}
    ref={inputRef} // Asociamos el input con la referencia
  />
  {/* Icono de ArrowForwardIos */}
  {query === '' && <ArrowForwardIos className="absolute right-3 text-gray-500" />}
</div>

      {isOpen && results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            background: 'white',
            zIndex: 999,
            listStyle: 'none',
            padding: '0',
            marginTop: '0.25rem',
            width: '100%',
          }}
          onMouseDown={(e) => e.preventDefault()} // Evita que el menú se cierre cuando se hace clic en las opciones
        >
          {results.map((location) => (
            <li
              key={location.place_id}
              onClick={() => handleSelect(location)}
              className="p-2 cursor-pointer hover:bg-gray-200"
            >
              {location.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
