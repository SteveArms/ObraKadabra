import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import { MainNav } from "./MainNav";
import { SaveStatus } from "./SaveStatus";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-space-md px-gutter lg:px-gutter-desktop">
        <Link href="/" className="flex shrink-0 items-center gap-space-xs rounded-md">
          <Icon name="deployed_code" size={28} filled className="text-primary-container" />
          <span className="font-display text-headline-sm tracking-tight text-primary">ObraKadabra</span>
        </Link>
        <MainNav variant="desktop" />
        <div className="flex shrink-0 items-center gap-space-xs">
          <SaveStatus />
          <Link
            href={`/proyecto/${DEFAULT_PROJECT_ID}/avance`}
            data-testid="header-log-progress"
            className={buttonClasses("milestone")}
          >
            <Icon name="photo_camera" />
            <span className="sr-only md:not-sr-only">Log progress</span>
          </Link>
          <Link
            href={`/compartir/${DEFAULT_PROJECT_ID}`}
            data-testid="header-share"
            className={buttonClasses("ghost")}
          >
            <Icon name="share" />
            <span className="sr-only md:not-sr-only">Share</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
