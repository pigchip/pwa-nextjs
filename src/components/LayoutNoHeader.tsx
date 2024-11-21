"use client";

import React, { useEffect, useState } from "react";
import HeaderComponent from "../app/HeaderComponent";
import FooterComponent from "../app/FooterComponent";

const LayoutNoHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Cargar valores guardados de localStorage al cargar el componente
    const savedStart = localStorage.getItem("savedStartLocation");
    const savedEnd = localStorage.getItem("savedEndLocation");
  }, []);

  return (
      <div className="flex flex-col h-[93vh] sm:h-screen overflow-hidden">
        <div className="flex-1 h-16">
          <div className="h-full">{children}</div>
        </div>
      </div>
  );
};

export default LayoutNoHeader;
