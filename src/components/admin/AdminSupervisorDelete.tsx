// components/AdminSupervisorDelete.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminSupervisorDelete = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/supervisors/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete supervisor');
      }

      const result = await response.json();
      setSuccess(result.message);
      router.push('/admin/supervisors');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <IconButton aria-label="back" style={{ color: '#6ABDA6' }} onClick={() => router.push('/admin/supervisors')}>
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-3xl font-bold text-center text-[#6ABDA6] flex-1">Eliminar Supervisor</h1>
      </div>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-500">{success}</div>}
      <form onSubmit={(e) => { e.preventDefault(); handleOpen(); }} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700">Supervisor ID</label>
          <input
            type="text"
            name="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#6ABDA6] text-white py-2 px-4 rounded-lg hover:bg-[#5aa58e] transition duration-200"
          disabled={loading}
        >
          {loading ? 'Eliminando...' : 'Eliminar Supervisor'}
        </button>
      </form>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this supervisor? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminSupervisorDelete;