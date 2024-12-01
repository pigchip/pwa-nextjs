'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Animation from '../Animation';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  // Definir la función handleLogout
  const handleLogout = () => {
    try {
      localStorage.removeItem('email');
      localStorage.setItem('showTutorial', 'false');
      localStorage.setItem('currentSession', 'false');
      console.log("Usuario ha cerrado sesión.");
      router.push('/'); // Redirigir a la página de inicio de sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    // Función para verificar la sesión actual
    const checkSession = () => {
      try {
        const currentSession = localStorage.getItem('currentSession');
        if (currentSession === 'true') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error al acceder a localStorage:', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();

    // Opcional: Escuchar cambios en localStorage para actualizar la autenticación en tiempo real
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'currentSession') {
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Mientras se verifica la autenticación, mostrar la animación
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Animation />
      </div>
    );
  }

  // Si no está autenticado, mostrar mensaje e botón para iniciar sesión
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Necesitas iniciar sesión</h2>
          <p className="text-gray-700 mb-6">
            Por favor, inicia sesión para acceder a todas las funcionalidades.
          </p>
          <button
            onClick={handleLogout} // Asociar handleLogout al botón
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Si está autenticado, renderizar los componentes hijos
  return (
    <Suspense fallback={<Animation />}>
      {children}
    </Suspense>
  );
};

export default Layout;
