// components/AdminSupervisorForm.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLinesStations } from '@/stores/LinesStationsContext';

const AdminSupervisorForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    sup: '',
    admin: '',
    line: 0,
    station: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { lines, stations } = useLinesStations();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fetch user by email
      const userResponse = await fetch(`/api/userByEmail/${formData.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Failed to fetch user by email');
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      if (!userId) {
        throw new Error('User not found');
      }

      // Create supervisor
      const supervisorData = {
        email: formData.email,
        sup: formData.sup,
        user: userId,
        admin: formData.admin,
        line: formData.line,
        station: formData.station,
      };

      const supervisorResponse = await fetch('/api/supervisor/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supervisorData),
      });

      if (!supervisorResponse.ok) {
        const errorData = await supervisorResponse.json();
        throw new Error(errorData.message || 'Failed to create supervisor');
      }

      const createdSupervisor = await supervisorResponse.json();
      console.log('Supervisor created:', createdSupervisor);
      router.push('/admin/supervisors');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <IconButton aria-label="back" style={{ color: '#6ABDA6' }} onClick={() => router.push('/admin/supervisors')}>
          <ArrowBackIcon />
        </IconButton>
        <h2 className="text-2xl font-bold text-center text-[#6ABDA6] flex-1">Agregar Supervisor</h2>
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">ID del Supervisor</label>
          <input
            type="text"
            name="sup"
            value={formData.sup}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Administrador</label>
          <input
            type="text"
            name="admin"
            value={formData.admin}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Línea</label>
          <select
            name="line"
            value={formData.line}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Selecciona una línea</option>
            {lines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.transport} - {line.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Estación</label>
          <select
            name="station"
            value={formData.station}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Selecciona una estación</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-[#6ABDA6] text-white py-2 px-4 rounded-lg hover:bg-[#5aa58e] transition duration-200"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Agregar Supervisor'}
        </button>
      </form>
    </div>
  );
};

export default AdminSupervisorForm;