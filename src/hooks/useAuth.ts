// src/hooks/useAuth.ts
import { useEffect, useState } from "react";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = () => {
      try {
        const currentSession = localStorage.getItem("currentSession");
        if (currentSession === "true") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error al acceder a localStorage:", error);
        setIsAuthenticated(false);
      }
    };

    checkSession();

    // Escuchar cambios en localStorage para actualizar la autenticación en tiempo real
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "currentSession") {
        checkSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return isAuthenticated;
};

export default useAuth;
