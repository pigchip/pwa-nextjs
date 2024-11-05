// components/AdminSupervisorEdit.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Supervisor } from "@/types/supervisor";

const AdminSupervisorEdit = () => {
  const [formData, setFormData] = useState<Supervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

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
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/supervisors/${id}`, {
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
      <h1 className="text-3xl font-bold mb-6 text-center text-[#6ABDA6]">
        Edit Supervisor
      </h1>
      {success && <div className="mb-4 text-green-500">{success}</div>}
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label className="block text-gray-700">Supervisor ID</label>
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
          <label className="block text-gray-700">User</label>
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
          <label className="block text-gray-700">Line</label>
          <input
            type="number"
            name="line"
            value={formData.line}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Station</label>
          <input
            type="number"
            name="station"
            value={formData.station}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#6ABDA6] text-white py-2 px-4 rounded-lg hover:bg-[#5aa58e] transition duration-200"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Supervisor"}
        </button>
      </form>
    </div>
  );
};

export default AdminSupervisorEdit;
