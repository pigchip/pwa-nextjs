// pages/admin/supervisors/[id].tsx
'use client';

import AdminSupervisorDetail from '@/components/admin/AdminSupervisorDetail';
import Layout from '@/components/Layout';

const SupervisorDetailPage = () => {
  return (
    <Layout>
      <AdminSupervisorDetail />
    </Layout>
  );
};

export default SupervisorDetailPage;