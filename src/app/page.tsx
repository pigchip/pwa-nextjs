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
  const [currentSession, setCurrentSession] = useState(false); // Nueva variable de estado para currentSession como booleano
  const router = useRouter();
  const { role } = useRole(); // Obtener el rol actual

  // Cargar los estados de showTutorial y currentSession desde localStorage al cargar la página
  useEffect(() => {
    // Cargar showTutorial
    const savedShowTutorial = localStorage.getItem('showTutorial');
    setShowTutorial(savedShowTutorial === 'true');
    console.log("Show Tutorial State Loaded:", savedShowTutorial === 'true');

    // Cargar currentSession
    const savedCurrentSession = localStorage.getItem('currentSession');
    if (savedCurrentSession !== null) {
      setCurrentSession(savedCurrentSession === 'true');
      console.log("Current Session Loaded:", savedCurrentSession === 'true');
    } else {
      // Si no hay una sesión guardada, inicializarla como false
      setCurrentSession(false);
      localStorage.setItem('currentSession', 'false');
      console.log("Current Session Initialized as False");
    }
  }, []);

  // Guardar currentSession en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('currentSession', currentSession.toString());
    console.log("Current Session Saved:", currentSession);
  }, [currentSession]);

  // Mostrar AuthForm después de la animación
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
      router.push('/admin/supervisors');
    }
    else if (role === 'supervisor') {
      router.push('/supervisor');
    }
  };

  return (
    <main>
      {showTutorial ? (
        <Tutorial onFinish={handleTutorialFinish} /> 
      ) : showAuthForm ? (
        <AuthForm 
          setShowTutorial={(value) => {
            setShowTutorial(value);
            localStorage.setItem('showTutorial', value.toString()); // Guardar en localStorage
          }}
          showTutorial={showTutorial} // Pasar la variable showTutorial
          currentSession={currentSession} // Pasar currentSession
          setCurrentSession={setCurrentSession} // Pasar setCurrentSession
        />
      ) : (
        <Animation />
      )}
    </main>
  );
}
