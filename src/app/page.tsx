'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Animation from './Animation';
import AuthForm from './AuthForm';
import Tutorial from './Tutorial';
import { useRole } from '@/contexts/RoleContext';

export default function Home() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false); // Controla si se debe mostrar el Tutorial o el Container
  const router = useRouter();
  const { role } = useRole(); // Obtener el rol actual

  // Cargar el estado de showTutorial desde localStorage al cargar la página
  useEffect(() => {
    const savedShowTutorial = localStorage.getItem('showTutorial');
    if (savedShowTutorial === 'true') {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
    console.log("Show Tutorial State Loaded:", savedShowTutorial);
  }, []);
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAuthForm(true); // Mostrar el formulario de autenticación después de la animación
    }, 5000); // Duración de la animación en milisegundos

    return () => clearTimeout(timer); // Limpia el timeout al desmontar
  }, []);

  const handleTutorialFinish = () => {
    if (role === 'user') {
      router.push('/navigation');
    }
    else if (role === 'admin') {
      router.push('/admin/users');
    }
    else if (role === 'supervisor') {
      router.push('/supervisor');
    }
  };

  return (
    <main>
      {showTutorial ? (
        <Tutorial onFinish={handleTutorialFinish} /> // Pass the callback to Tutorial
      ) : showAuthForm ? (
        <AuthForm 
          setShowTutorial={(value) => {
            setShowTutorial(value);
            localStorage.setItem('showTutorial', value.toString()); // Guardar en localStorage
          }}
          showTutorial={showTutorial} // Pasar la variable showTutorial
        />
      ) : (
        <Animation />
      )}
    </main>
  );
}