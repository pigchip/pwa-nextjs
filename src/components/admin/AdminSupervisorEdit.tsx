// components/AdminSupervisorEdit.tsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Supervisor } from "@/types/supervisor";
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLinesStations } from '@/stores/LinesStationsContext';

const AdminSupervisorEdit = () => {
  const [formData, setFormData] = useState<Supervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const id = useParams().id;
  const router = useRouter();
  const { lines, stations, getFirstAndLastStations } = useLinesStations();
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchSupervisor = async () => {
      try {
        const response = await fetch("/api/supervisors");
        if (!response.ok) {
          throw new Error("Failed to fetch supervisors");
        }
        const data: Supervisor[] = await response.json();
        const foundSupervisor = data.find((sup) => sup.sup === id);
        if (!foundSupervisor) {
          throw new Error("Supervisor not found");
        }
        setFormData(foundSupervisor);
        setFilteredStations(stations.filter(station => station.line === foundSupervisor.line));
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisor();
  }, [id, stations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'line') {
      const lineId = Number(value);
      setFilteredStations(stations.filter(station => station.line === lineId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const response = await fetch(`/api/supervisor/update/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update supervisor");
      }
  
      const result = await response.json();
      console.log(result);
      setSuccess("Supervisor updated successfully");
      router.push("/admin/supervisors");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Supervisor not found
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <IconButton aria-label="back" style={{ color: '#6ABDA6' }} onClick={() => router.push('/admin/supervisors')}>
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-3xl font-bold text-center text-[#6ABDA6] flex-1">Editar Supervisor</h1>
      </div>
      {success && <div className="mb-4 text-green-500">{success}</div>}
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md"
      >
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
          <label className="block text-gray-700">Usuario</label>
          <input
            type="number"
            name="user"
            value={formData.user}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Admin</label>
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
            {lines.map((line) => {
              const { firstStation, lastStation } = getFirstAndLastStations(line.id);
              return (
                <option key={line.id} value={line.id}>
                  {line.transport} {line.name} ({firstStation?.name} - {lastStation?.name})
                </option>
              );
            })}
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
            {filteredStations.map((station) => (
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
          {loading ? "Actualizando..." : "Actualizar Supervisor"}
        </button>
      </form>
    </div>
  );
};

export default AdminSupervisorEdit;