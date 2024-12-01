'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Animation from './Animation';
import AuthForm from './AuthForm';

export default function Home() {
  // Inicializa currentSession desde localStorage, si está disponible
  const [currentSession, setCurrentSession] = useState(() => {
    const savedSession = localStorage.getItem('currentSession');
    return savedSession === 'true'; // Retorna true o false según lo guardado
  });

  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem('hasSeenTutorial') !== 'true';
  });

  const router = useRouter();

  // Guardar currentSession en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('currentSession', currentSession.toString());
    console.log('Current Session Saved:', currentSession);
  }, [currentSession]);

  // Mostrar AuthForm después de la animación
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAuthForm(true); // Mostrar el formulario de autenticación después de la animación
    }, 5000); // Duración de la animación en milisegundos

    return () => clearTimeout(timer); // Limpia el timeout al desmontar
  }, []);

  return (
    <main>
      {showAuthForm ? (
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
