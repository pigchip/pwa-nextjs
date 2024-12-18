"use client";

import React, { useEffect, useState } from "react";
import { Knock } from "@knocklabs/node";
import { Inter } from "next/font/google";
import useUserStore from "@/stores/useUser";
import { RoleProvider } from "@/contexts/RoleContext";
import { SelectedItineraryProvider } from "@/contexts/SelectedItineraryContext";
import { ReportsProvider } from "@/contexts/ReportsContext";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { LinesStationsProvider } from "@/stores/LinesStationsContext";
import Animation from "./Animation"; // Asegúrate de ajustar la ruta según tu estructura de carpetas
import { RoutesProvider } from "@/contexts/RoutesContext";
import { UsersProvider } from "@/contexts/UsersContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [isKnockInitialized, setKnockInitialized] = useState(false);

  const { userDetails, fetchUserDetails } = useUserStore();

  useEffect(() => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) {
        // No hay SW registrados, registrar uno nuevo
        navigator.serviceWorker
          .register("/custom-sw.js", { scope: "/" })
          .then(() => {
            console.log("Service Worker registrado correctamente.");
          })
          .catch((error) => {
            console.error("Error al registrar el Service Worker:", error);
          });
      } else {
        console.log("Service Worker ya registrado.");
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email =
        localStorage.getItem("email") || "iespinosas1700@alumno.ipn.mx";
      setStoredEmail(email);
    }
  }, []);

  useEffect(() => {
    if (storedEmail) {
      fetchUserDetails(storedEmail);
    }
  }, [storedEmail, fetchUserDetails]);

  useEffect(() => {
    if (storedEmail && !isKnockInitialized) {
      const knockClient = new Knock(
        process.env.NEXT_PUBLIC_KNOCK_SECRET_API_KEY
      );

      knockClient.users
        .identify(storedEmail, {
          email: storedEmail,
          name: userDetails?.name || "Usuario/a",
        })
        .then((response) => {
          console.log("Knock user identified:", response);
          setKnockInitialized(true);
        })
        .catch((err) => {
          console.error("Knock initialization failed:", err);
        });
    }
  }, [storedEmail, userDetails, isKnockInitialized]);

  if (!storedEmail) {
    return (
      <html lang="en">
        <body>
          <Animation />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta
          name="theme-color"
          content="#fff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <RoleProvider>
          <RoutesProvider>
            <LinesStationsProvider>
              <UsersProvider>
                <SelectedItineraryProvider>
                  <ReportsProvider>{children}</ReportsProvider>
                </SelectedItineraryProvider>
              </UsersProvider>
            </LinesStationsProvider>
          </RoutesProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
