// src/app/supervisor/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";

const SupervisorLayout = ({ children }: { children: React.ReactNode }) => {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role !== "supervisor") {
      router.push("/"); // Redirect to home page if not a supervisor
    }
  }, [role, router]);

  if (role !== "supervisor") {
    return null; // Render nothing while redirecting
  }

  return <>{children}</>;
};

export default SupervisorLayout;