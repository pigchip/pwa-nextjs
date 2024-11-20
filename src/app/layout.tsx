"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ReportsProvider } from "@/contexts/ReportsContext";
import { SelectedItineraryProvider } from "@/contexts/SelectedItineraryContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { Knock } from "@knocklabs/node";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      setStoredEmail(email);
    } else {
      console.error("Email not found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (storedEmail) {
      const knockClient = new Knock(process.env.NEXT_PUBLIC_KNOCK_SECRET_API_KEY);
      knockClient.users.identify(storedEmail.toString(), {
        email: storedEmail ?? undefined,
      }).then(knockUser => {
        console.log(knockUser);
      }).catch(error => {
        console.error("Error identifying user with Knock:", error);
      });
    }
  }, [storedEmail]);

  if (!storedEmail) {
    return <div>Loading...</div>;
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
      </head>
      <RoleProvider>
        <SelectedItineraryProvider>
          <ReportsProvider>
            <body>{children}</body>
          </ReportsProvider>
        </SelectedItineraryProvider>
      </RoleProvider>
    </html>
  );
}
