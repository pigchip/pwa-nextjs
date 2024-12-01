// src/app/supervisor/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import Animation from "../Animation"; // Asegúrate de que la ruta es correcta
import useAuth from "@/hooks/useAuth";

const SupervisorLayout = ({ children }: { children: React.ReactNode }) => {
  const { role } = useRole();
  const router = useRouter();
  const isAuthenticated = useAuth();

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    try {
      localStorage.removeItem("email");
      localStorage.setItem("showTutorial", "false");
      localStorage.setItem("currentSession", "false");
      console.log("Usuario ha cerrado sesión.");
      router.push("/"); // Redirigir a la página de inicio de sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Verificar el rol del usuario
  useEffect(() => {
    if (isAuthenticated === true && role !== "supervisor" && role !== "admin") {
      router.push("/"); // Redirigir a la página de inicio si no es supervisor o admin
    }
  }, [role, isAuthenticated, router]);

  // Renderización condicional

  if (isAuthenticated === null) {
    // Verificando la autenticación
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Animation />
      </div>
    );
  }

  if (!isAuthenticated) {
    // No está autenticado
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

  if (role !== "supervisor" && role !== "admin") {
    // Está autenticado, pero no tiene el rol adecuado
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Animation />
      </div>
    );
  }

  // Está autenticado y tiene el rol adecuado
  return <>{children}</>;
};

export default SupervisorLayout;
