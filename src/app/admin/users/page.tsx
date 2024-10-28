"use client";

import React, { useEffect, useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import Layout from "@/components/Layout";

const UsersPage = () => {
  const { role } = useRole();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server
  }

  if (role !== "admin") {
    return null; // Render nothing if not an admin
  }

  return <Layout>Users page</Layout>;
};

export default UsersPage;
