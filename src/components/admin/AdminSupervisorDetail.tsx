// components/AdminSupervisorDetail.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Supervisor } from '@/types/supervisor';

const AdminSupervisorDetail = () => {
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

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
    return <div className="flex justify-center items-center h-screen">Supervisor not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#6ABDA6]">Supervisor Details</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p><strong>Supervisor ID:</strong> {supervisor.sup}</p>
        <p><strong>User:</strong> {supervisor.user}</p>
        <p><strong>Admin:</strong> {supervisor.admin}</p>
        <p><strong>Line:</strong> {supervisor.line}</p>
        <p><strong>Station:</strong> {supervisor.station}</p>
      </div>
    </div>
  );
};

export default AdminSupervisorDetail;