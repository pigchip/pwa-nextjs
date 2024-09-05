"use client";

import { useState, useEffect } from 'react';
import Animation from './Animation';
import AuthForm from './AuthForm';

export default function Home() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAuthForm(true); // Mostrar el formulario de autenticación después de la animación
    }, 3500); // Duración de la animación en milisegundos

    return () => clearTimeout(timer); // Limpia el timeout al desmontar
  }, []);

  return (
    <main>
      {showAuthForm ? (
        <AuthForm />
      ) : (
        <Animation />
      )}
    </main>
  );
}
