// pages/admin/supervisors/index.tsx
"use client";

import AdminSupervisorList from "@/components/admin/AdminSupervisorList";
import Layout from "@/components/Layout";

const AdminSupervisorsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto py-6 px-4">
          <AdminSupervisorList />
        </main>
      </div>
    </Layout>
  );
};

export default AdminSupervisorsPage;
