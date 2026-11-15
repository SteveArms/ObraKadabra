import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/site";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: "ObraKadabra", template: "%s · ObraKadabra" },
  description: "Turn a 2D floor plan into a 3D home linked to its construction schedule and budget.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

// Shared by the app and the family view; each route group adds its own header and footer
export default function RootLayout({ children }: { children: ReactNode }) {
  const fontVariables = `${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`;
  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans text-body-md">
        <a
          href="#main"
          className="sr-only rounded-md bg-surface-container-lowest px-space-sm py-space-xs focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
