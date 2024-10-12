import React, { useState, useEffect, useCallback } from 'react';
import { Register, Status, RegisterResponse } from '@/types/register';

const RegisterList: React.FC = () => {
  const [registers, setRegisters] = useState<Register[]>([]);
  const [filteredRegisters, setFilteredRegisters] = useState<Register[]>([]);
  const [filters, setFilters] = useState({
    user: '',
    transport: '',
    line: '',
    route: '',
    station: '',
    status: '',
    sort: 'mostRecent', // Default sorting order
    search: '', // Search term
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  useEffect(() => {
    const fetchRegisters = async () => {
      try {
        const response = await fetch('/api/reports');
        const data: RegisterResponse = await response.json();
        setRegisters(data.data);
        setFilteredRegisters(data.data);
      } catch (error) {
        console.error('Error fetching registers:', error);
        setRegisters([]); // Ensure registers is always an array
        setFilteredRegisters([]);
      }
    };

    fetchRegisters();
  }, []);

  const filterRegisters = useCallback(() => {
    let filtered = registers;

    if (filters.user) {
      filtered = filtered.filter(register => register.user.toString().includes(filters.user));
    }
    if (filters.transport) {
      filtered = filtered.filter(register => register.transport.includes(filters.transport));
    }
    if (filters.line) {
      filtered = filtered.filter(register => register.line.toString().includes(filters.line));
    }
    if (filters.route) {
      filtered = filtered.filter(register => register.route.toString().includes(filters.route));
    }
    if (filters.station) {
      filtered = filtered.filter(register => register.station.toString().includes(filters.station));
    }
    if (filters.status) {
      filtered = filtered.filter(register => register.status === filters.status);
    }
    if (filters.search) {
      filtered = filtered.filter(register =>
        Object.values(register).some(value =>
          value.toString().toLowerCase().includes(filters.search.toLowerCase())
        )
      );
    }

    // Sort by date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return filters.sort === 'mostRecent' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    setFilteredRegisters(filtered);
  }, [registers, filters]);

  useEffect(() => {
    filterRegisters();
  }, [filters, currentPage, filterRegisters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const uniqueValues = (key: keyof Register) => {
    return Array.from(new Set(registers.map(register => register[key])));
  };

  // Calculate paginated data
  const paginatedRegisters = filteredRegisters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredRegisters.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          name="search"
          placeholder="Buscar"
          value={filters.search}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded"
        />
        <select name="user" value={filters.user} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="">Todos los usuarios</option>
          {uniqueValues('user').map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        <select name="transport" value={filters.transport} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="">Todos los transportes</option>
          {uniqueValues('transport').map(transport => (
            <option key={transport} value={transport}>{transport}</option>
          ))}
        </select>
        <select name="line" value={filters.line} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="">Todas las líneas</option>
          {uniqueValues('line').map(line => (
            <option key={line} value={line}>{line}</option>
          ))}
        </select>
        <select name="route" value={filters.route} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="">Todas las rutas</option>
          {uniqueValues('route').map(route => (
            <option key={route} value={route}>{route}</option>
          ))}
        </select>
        <select name="station" value={filters.station} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="">Todas las estaciones</option>
          {uniqueValues('station').map(station => (
            <option key={station} value={station}>{station}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="">Todos los status</option>
          {Object.values(Status).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select name="sort" value={filters.sort} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="mostRecent">Más reciente</option>
          <option value="leastRecent">Menos reciente</option>
        </select>
      </div>
      <ul className="space-y-4">
        {paginatedRegisters.map(register => (
          <li key={register.id} className="p-4 border border-gray-300 rounded shadow">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <p><strong>User:</strong> {register.user}</p>
                <p><strong>Transport:</strong> {register.transport}</p>
                <p><strong>Line:</strong> {register.line}</p>
                <p><strong>Route:</strong> {register.route}</p>
                <p><strong>Station:</strong> {register.station}</p>
                <p><strong>Date:</strong> {register.date}</p>
                <p><strong>Status:</strong> {register.status}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <p><strong>Time:</strong> {register.time}</p>
                <p><strong>Body:</strong> {register.body}</p>
                <p><strong>Coordinates:</strong> ({register.x}, {register.y})</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 mx-1 border rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RegisterList;