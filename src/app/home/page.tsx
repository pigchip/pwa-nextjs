// src/app/page.tsx
"use client";

import React from "react";
import { useRole } from "@/contexts/RoleContext";
import Layout from "@/components/Layout";

const HomePage: React.FC = () => {
  const { role } = useRole();

  const getMessage = () => {
    switch (role) {
      case "admin":
        return "Bienvenido Administrador! Tienes acceso total al sistema.";
      case "user":
        return "Bienvenido Usuario! Puedes agregar una ruta o ver tus rutas.";
      case "supervisor":
        return "Bienvenido Supervisor! Puedes autorizar los reportes de los usuarios.";
      default:
        return "Bienvenido! Por favor inicia sesión.";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-black">
        <h1 className="text-4xl font-bold mb-4">Home Page</h1>
        <p className="text-xl">{getMessage()}</p>
      </div>
    </Layout>
  );
};

export default HomePage;
