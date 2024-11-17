"use client";

import Layout from '@/components/Layout'
import React, { useEffect, useState } from 'react'
import { useRole } from '@/contexts/RoleContext';
import RegisterList from '@/components/RegisterList';

const Page = () => {
  const { role } = useRole();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server
  }

  if (role !== 'supervisor' && role !== 'admin') {
    return null; // Render nothing if not a supervisor
  }

  return (
    <Layout>
      <RegisterList />
    </Layout>
  )
}

export default Page;