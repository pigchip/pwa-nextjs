// components/AdminSupervisorList.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Supervisor } from "@/types/supervisor";
import { IconButton, Button } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLinesStations } from "@/stores/LinesStationsContext";

const AdminSupervisorList = () => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { lines, stations } = useLinesStations();

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await fetch("/api/supervisors");
        if (!response.ok) {
          throw new Error("Failed to fetch supervisors");
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#6ABDA6]">
        Supervisores
      </h1>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-[#6ABDA6] text-white">
            <tr>
              <th className="py-3 px-6 border-b">Supervisor ID</th>
              <th className="py-3 px-6 border-b">Usuario</th>
              <th className="py-3 px-6 border-b">Admin</th>
              <th className="py-3 px-6 border-b">Línea</th>
              <th className="py-3 px-6 border-b">Estación</th>
              <th className="py-3 px-6 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map((supervisor) => (
              <tr key={supervisor.sup} className="hover:bg-gray-100">
                <td className="py-3 px-6 border-b text-center">
                  {supervisor.sup}
                </td>
                <td className="py-3 px-6 border-b text-center">
                  {supervisor.user}
                </td>
                <td className="py-3 px-6 border-b text-center">
                  {supervisor.admin}
                </td>
                <td className="py-3 px-6 border-b text-center">
                  {lines.find(line => line.id === supervisor.line)?.information || supervisor.line}
                </td>
                <td className="py-3 px-6 border-b text-center">
                  {stations.find(station => station.id === supervisor.station)?.name || supervisor.station}
                </td>
                <td className="py-3 px-6 border-b text-center">
                  <IconButton
                    aria-label="view"
                    color="primary"
                    onClick={() =>
                      router.push(`/admin/supervisors/${supervisor.sup}`)
                    }
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    aria-label="edit"
                    color="secondary"
                    onClick={() =>
                      router.push(`/admin/supervisors/${supervisor.sup}/edit`)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={() =>
                      router.push(`/admin/supervisors/${supervisor.sup}/delete`)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4">
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#6ABDA6",
            "&:hover": { backgroundColor: "#5aa58e" },
          }}
          onClick={() => router.push("/admin/supervisors/new")}
        >
          Crear nuevo supervisor
        </Button>
      </div>
    </div>
  );
};

export default AdminSupervisorList;