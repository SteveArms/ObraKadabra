import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainNav } from "@/components/layout/MainNav";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: { default: "ObraKadabra", template: "%s · ObraKadabra" },
  description: "Turn a 2D floor plan into a 3D home linked to its construction schedule and budget.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

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
        <AppHeader />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
          <AppFooter />
        </div>
        <MainNav variant="mobile" />
      </body>
    </html>
  );
}
