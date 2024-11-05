// pages/admin/supervisors/[id]/edit.tsx
'use client'; 

import AdminSupervisorEdit from '@/components/admin/AdminSupervisorEdit';
import Layout from '@/components/Layout';

const EditSupervisorPage = () => {
  return (
    <Layout>
      <AdminSupervisorEdit />
    </Layout>
  );
};

export default EditSupervisorPage;