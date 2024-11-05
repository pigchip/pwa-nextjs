// pages/admin/supervisors/new.tsx
'use client';

import AdminSupervisorForm from '@/components/admin/AdminSupervisorForm';
import Layout from '@/components/Layout';

const NewSupervisorPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto py-6 px-4">
          <AdminSupervisorForm />
        </main>
      </div>
    </Layout>
  );
};

export default NewSupervisorPage;