import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { BrandLink } from "@/components/layout/BrandLink";

// The family view has no app navigation or tools: only the brand, the home and the footer
export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-gutter lg:px-gutter-desktop">
          <BrandLink />
        </div>
      </header>
      <main id="main" className="flex flex-1 flex-col bg-surface">
        {children}
      </main>
      <AppFooter />
    </>
  );
}
