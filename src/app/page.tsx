'use client';

import { useState, useEffect } from 'react';
import Animation from './Animation';
import AuthForm from './AuthForm';
import Container from './Container';
import Tutorial from './Tutorial';

export default function Home() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAuthForm(true); // Mostrar el formulario de autenticación después de la animación
    }, 5000); // Duración de la animación en milisegundos

    return () => clearTimeout(timer); // Limpia el timeout al desmontar
  }, []);

  return (
    <main>
      {showAuthForm ? <Container /> : <Animation />}
    </main>
  );
}
