// src/config/metadata.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MobilityTimeSaver",
  description: "Progressive web application made with NextJS",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "next14", "pwa", "next-pwa"],
  authors: [
    {
      name: "pigchip",
      url: "https://www.linkedin.com/in/amgc2002/",
    },
  ],
  icons: [
    { rel: "apple-touch-icon", url: "/icon-128.png" },
    { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  shrinkToFit: "no",
  viewportFit: "cover",
};