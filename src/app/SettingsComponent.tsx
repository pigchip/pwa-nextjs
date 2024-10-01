import React, { useState } from 'react';
import Image from 'next/image';

// Validaciones
const validatePassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{8,}$/.test(value);

const SettingsComponent: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Función para abrir el modal
  const handleDeleteAccountClick = () => {
    setShowModal(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('email'); // Eliminar email de localStorage
    localStorage.setItem('showTutorial', 'false'); // Cambiar el estado de showTutorial en localStorage
    window.location.reload(); // Recargar la página para simular cierre de sesión
  };

  // Función para manejar el envío del formulario de eliminación de cuenta
  const handleDeleteAccount = async () => {

    const email = localStorage.getItem('email'); // Obtener email de localStorage

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una letra y un número.');
      return;
    }

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Verificar si la eliminación fue exitosa
      if (data === true) {
        handleCloseModal(); // Cerrar el modal después de eliminar
        alert('Cuenta eliminada correctamente.');
        
        // Cerrar sesión después de eliminar la cuenta
        localStorage.removeItem('email'); // Eliminar email de localStorage
        handleLogout();
      } else {
        setError('Error al eliminar la cuenta. Intenta de nuevo.');
      }

    } catch (error) {
      setError('Error al eliminar la cuenta. Intenta de nuevo.');
    }
  };

  return (
    <div className="flex flex-col h-full justify-between bg-gray-100 overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-col items-start w-full pl-5">
        <h2 className="text-xl font-bold text-black">Opciones</h2>
      </div>

      {/* Bottom Buttons and Image */}
      <div className="pb-4 flex flex-col items-center">
        <div className="flex flex-col items-center space-y-4">
          <button className="w-64 py-2 bg-[#602e2e] text-white font-semibold rounded-lg">
            Borrar historial búsquedas
          </button>
          <button
            className="w-64 py-2 bg-red-400 text-white font-semibold rounded-lg"
            onClick={handleDeleteAccountClick}
          >
            Eliminar cuenta
          </button>
          <button className="w-64 py-2 bg-blue-500 text-white font-semibold rounded-lg" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <Image src="/icon-512.png" alt="Logo" width={64} height={64} className="mt-4" />
      </div>

      {/* Modal de eliminación de cuenta */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center text-black">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Eliminar cuenta</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <label className="block mb-4">
              Contraseña:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
                placeholder="Introduce tu contraseña"
              />
            </label>
            <div className="flex justify-end space-x-2">
              <button className="bg-gray-300 text-black px-4 py-2 rounded" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleDeleteAccount}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsComponent;
