// FILE: page.tsx-1
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';
import LiveLocationComponent from '@/components/LiveLocationComponent'; // Import the component
import { useRole } from '@/contexts/RoleContext';
import Modal from '../Modal';

const validatePassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{8,}$/.test(value);

const SettingsComponent: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false); // State for location modal
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { role } = useRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  const openModal = (title: string, message: string) => {
    setModalContent({ title, message });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const router = useRouter();

  const handleDeleteAccountClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('email');
    localStorage.setItem('showTutorial', 'false');
    localStorage.setItem('currentSession', 'false');
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    const email = localStorage.getItem('email');

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

      if (data === true) {
        handleCloseModal();
        openModal("Éxito", "Cuenta eliminada correctamente.");
        localStorage.removeItem('email');
        handleLogout();
      } else {
        setError('Error al eliminar la cuenta. Intenta de nuevo.');
      }
    } catch (error) {
      setError('Error al eliminar la cuenta. Intenta de nuevo.');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full justify-between bg-gray-100 overflow-hidden">
        <div className="flex flex-col items-start w-full pl-5">
          <h2 className="text-xl font-bold text-black">Opciones</h2>
        </div>

        <div className="pb-4 flex flex-col items-center">
          <div className="flex flex-col items-center space-y-4">
            {/* <button className="w-64 py-2 bg-[#602e2e] text-white font-semibold rounded-lg">
              Borrar historial búsquedas
            </button> */}
            <button className="w-64 py-2 bg-blue-500 text-white font-semibold rounded-lg" onClick={handleLogout}>
              Cerrar sesión
            </button>
            
            {role === 'user' && (
              <>
                <button
                  className="w-64 py-2 bg-red-400 text-white font-semibold rounded-lg"
                  onClick={handleDeleteAccountClick}
                >
                  Eliminar cuenta
                </button>
                <button
                  className="w-64 py-2 bg-green-500 text-white font-semibold rounded-lg"
                  onClick={() => setShowLocationModal(true)} // Open location modal
                >
                  Compartir ubicación actual
                </button>
                <button
                  className="w-64 py-2 bg-purple-500 text-white font-semibold rounded-lg"
                  onClick={() => router.push('/most-visited')}
                >
                  Ver líneas y estaciones más visitadas
                </button>
              </>
            )}
          </div>
          <Image src="/icon-512.png" alt="Logo" width={64} height={64} className="mt-4" />
        </div>

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

        {showLocationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center text-black">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Compartir ubicación actual</h3>
              <LiveLocationComponent />
              <div className="flex justify-end space-x-2 mt-4">
                <button className="bg-gray-300 text-black px-4 py-2 rounded" onClick={() => setShowLocationModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={modalContent.title}
          message={modalContent.message}
        />

      </div>
    </Layout>
  );
};

export default SettingsComponent;