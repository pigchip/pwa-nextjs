// components/AdminSupervisorDetail.tsx

import { useEffect, useState } from 'react';
import { Supervisor } from '@/types/supervisor';
import { useParams, useRouter } from 'next/navigation';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLinesStations } from '@/stores/LinesStationsContext';

const AdminSupervisorDetail = () => {
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { lines, stations } = useLinesStations();

  useEffect(() => {
    if (!id) return;

    const fetchSupervisors = async () => {
      try {
        const response = await fetch('/api/supervisors');
        if (!response.ok) {
          throw new Error('Failed to fetch supervisors');
        }
        const data: Supervisor[] = await response.json();
        const foundSupervisor = data.find((sup) => sup.sup === id);
        if (!foundSupervisor) {
          throw new Error('Supervisor not found');
        }
        setSupervisor(foundSupervisor);
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

    fetchSupervisors();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!supervisor) {
    return <div className="flex justify-center items-center h-screen">El supervisor no fue encontrado</div>;
  }

  const lineName = lines.find(line => line.id === supervisor.line)?.information || supervisor.line;
  const stationName = stations.find(station => station.id === supervisor.station)?.name || supervisor.station;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <IconButton aria-label="back" style={{ color: '#6ABDA6' }} onClick={() => router.push('/admin/supervisors')}>
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-3xl font-bold text-center text-[#6ABDA6] flex-1">Detalles del supervisor</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p><strong>Supervisor ID:</strong> {supervisor.sup}</p>
        <p><strong>Usuario:</strong> {supervisor.user}</p>
        <p><strong>Admin:</strong> {supervisor.admin}</p>
        <p><strong>Línea:</strong> {lineName}</p>
        <p><strong>Estación:</strong> {stationName}</p>
      </div>
    </div>
  );
};

export default AdminSupervisorDetail;