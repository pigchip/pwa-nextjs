"use client";

import Layout from '@/components/Layout'
import React, { useEffect, useState } from 'react'
import { useRole } from '@/contexts/RoleContext';

const Page = () => {
  const { role } = useRole();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server
  }

  if (role !== 'supervisor') {
    return null; // Render nothing if not a supervisor
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-black">
        <h1 className="text-4xl font-bold mb-4">Página del supervisor</h1>
        <p className="text-xl">Bienvenido Supervisor! Puedes autorizar los reportes de los usuarios.</p>
      </div>
    </Layout>
  )
}

export default Page;