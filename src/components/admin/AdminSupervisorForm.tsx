// components/AdminSupervisorForm.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#6ABDA6]">Agregar Supervisor</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
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
        {loading ? 'Submitting...' : 'Agregar Supervisor'}
      </button>
    </form>
  );
};

export default AdminSupervisorForm;