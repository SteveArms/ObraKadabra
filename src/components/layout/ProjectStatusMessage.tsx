import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import { PageSkeleton } from "./PageSkeleton";

// Shared by every screen that opens one project: shown while it loads from storage, or when it does not exist
export function ProjectStatusMessage({ status }: { status: "loading" | "missing" }) {
  if (status === "loading") return <PageSkeleton label="Loading project…" variant="workspace" />;
  return (
    <div data-testid="project-missing" className="mx-auto flex w-full max-w-xl flex-col items-start gap-space-md px-gutter py-space-xl">
      <Icon name="folder_off" size={40} className="text-primary" />
      <h1 className="font-display text-headline-md text-balance">Project not found</h1>
      <p className="text-body-md text-pretty text-on-surface-variant">It may have been deleted, or it was saved in another browser or account.</p>
      <div className="flex flex-wrap gap-space-sm">
        <Link href="/" className={buttonClasses("primary")}>
          Go to my projects
        </Link>
        <Link href={`/proyecto/${DEFAULT_PROJECT_ID}`} className={buttonClasses("ghost")}>
          Open a demo
        </Link>
      </div>
    </div>
  );
}
