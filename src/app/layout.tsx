import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },  // Asegura que esté bien especificado
  ],
};

// Exporta `themeColor` y `viewport` por separado
export const themeColor = {
  color: [
    { media: "(prefers-color-scheme: dark)", color: "#000" },
    { media: "(prefers-color-scheme: light)", color: "#fff" },
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  shrinkToFit: "no",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="theme-color" content="#fff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />  {/* Asegúrate de incluir el favicon aquí */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body>{children}</body>
    </html>
  );
}
