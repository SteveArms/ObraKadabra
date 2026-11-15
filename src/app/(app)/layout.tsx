import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainNav } from "@/components/layout/MainNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <OfflineBanner />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        <AppFooter />
      </div>
      <MainNav variant="mobile" />
    </>
  );
}
