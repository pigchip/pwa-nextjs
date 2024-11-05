// app/admin/layout.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useRouter } from "next/navigation";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { role } = useRole();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && role !== "admin") {
      router.push("/"); // Redirect to home if not an admin
    }
  }, [isClient, role, router]);

  if (!isClient) {
    return null; // Render nothing on the server
  }

  if (role !== "admin") {
    return null; // Render nothing if not an admin
  }

  return <div>{children}</div>;
};

export default AdminLayout;
