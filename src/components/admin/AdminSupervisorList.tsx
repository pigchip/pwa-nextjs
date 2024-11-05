// components/AdminSupervisorList.tsx

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Supervisor } from '@/types/supervisor';
import { IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminSupervisorList = () => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await fetch('/api/supervisors');
        if (!response.ok) {
          throw new Error('Failed to fetch supervisors');
        }
        const data: Supervisor[] = await response.json();
        setSupervisors(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#6ABDA6]">Supervisors</h1>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-[#6ABDA6] text-white">
            <tr>
              <th className="py-3 px-6 border-b">Supervisor ID</th>
              <th className="py-3 px-6 border-b">User</th>
              <th className="py-3 px-6 border-b">Admin</th>
              <th className="py-3 px-6 border-b">Line</th>
              <th className="py-3 px-6 border-b">Station</th>
              <th className="py-3 px-6 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map((supervisor) => (
              <tr key={supervisor.sup} className="hover:bg-gray-100">
                <td className="py-3 px-6 border-b text-center">{supervisor.sup}</td>
                <td className="py-3 px-6 border-b text-center">{supervisor.user}</td>
                <td className="py-3 px-6 border-b text-center">{supervisor.admin}</td>
                <td className="py-3 px-6 border-b text-center">{supervisor.line}</td>
                <td className="py-3 px-6 border-b text-center">{supervisor.station}</td>
                <td className="py-3 px-6 border-b text-center">
                  <Link href={`/admin/supervisors/${supervisor.sup}`} passHref>
                    <IconButton aria-label="view" color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Link>
                  <Link href={`/admin/supervisors/${supervisor.sup}/edit`} passHref>
                    <IconButton aria-label="edit" color="secondary">
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <Link href={`/admin/supervisors/${supervisor.sup}/delete`} passHref>
                    <IconButton aria-label="delete" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSupervisorList;