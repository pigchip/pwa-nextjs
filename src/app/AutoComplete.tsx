import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDebounce } from './useDebounce';
import { ArrowForwardIos } from '@mui/icons-material';

interface AutoCompleteProps {
  placeholder: string;
  onSelect: (location: { lat: number, lon: number, display_name: string } | null) => void;
  value?: string;
}

export default function AutoComplete({ placeholder, onSelect, value }: AutoCompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ lat: number, lon: number, display_name: string, place_id: number }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 500);

  // Synchronize the query with the value prop
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    // Don't show results if the query is too long
    if (debouncedQuery.length > 20) {
      setResults([]);
      setIsOpen(false);
      return;
    }
  
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
            countrycodes: 'MX',
          },
        });
        console.log('Results from API:', data); // Verifica los resultados recibidos de la API
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
    setIsSelecting(false);
    const newQuery = e.target.value;
    console.log('Query changed to:', newQuery); // Verifica el valor ingresado en el input
    setQuery(newQuery);
  
    if (newQuery.trim() === '') {
      onSelect(null);
      setResults([]);
      setIsOpen(false);
    }
  };
  

  const handleSelect = (location: { lat: number, lon: number, display_name: string }) => {
    setIsSelecting(true);
    setQuery(location.display_name);
    setResults([]);
    setIsOpen(false);
    console.log('Selected location passed to parent:', location);
    onSelect(location);    
  
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };
  

  const handleFocus = () => {
    if (results.length > 0 && !isSelecting) {
      setIsOpen(true); // Solo abre el menú si hay resultados y no estamos seleccionando
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      // Si no estamos seleccionando una opción, cerramos el menú
      if (!isSelecting) setIsOpen(false);
    }, 150); // Añadimos un retraso para asegurar la selección
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
          ref={inputRef}
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
          onMouseDown={(e) => e.preventDefault()} // Evita cerrar el menú al hacer clic en la lista
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
