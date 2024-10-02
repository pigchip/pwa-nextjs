"use client";

import React, { useEffect, useState } from "react";
import HeaderComponent from "../app/HeaderComponent";
import FooterComponent from "../app/FooterComponent";
import { SelectedItineraryProvider } from "@/app/contexts/SelectedItineraryContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Cargar valores guardados de localStorage al cargar el componente
    const savedStart = localStorage.getItem("savedStartLocation");
    const savedEnd = localStorage.getItem("savedEndLocation");
  }, []);

  return (
    <SelectedItineraryProvider>
      <div className="flex flex-col h-[93vh] sm:h-screen overflow-hidden">
        <div className="flex-none h-16 bg-gray-200">
          <HeaderComponent />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </div>
        <div className="flex-none h-16 bg-gray-200">
          <FooterComponent />
        </div>
      </div>
    </SelectedItineraryProvider>
  );
};

export default Layout;
