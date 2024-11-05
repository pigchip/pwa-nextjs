// pages/admin/supervisors/[id]/delete.tsx

import AdminSupervisorDelete from '@/components/admin/AdminSupervisorDelete';
import Layout from '@/components/Layout';

const DeleteSupervisorPage = () => {
  return (
    <Layout>
      <AdminSupervisorDelete />
    </Layout>
  );
};

export default DeleteSupervisorPage;