import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

// Shared by every screen that opens one project: shown while it loads from storage, or when it does not exist
export function ProjectStatusMessage({ status }: { status: "loading" | "missing" }) {
  if (status === "loading") return <p className="px-gutter py-space-xl text-body-md lg:px-gutter-desktop">Loading project…</p>;
  return (
    <div className="flex flex-col items-start gap-space-sm px-gutter py-space-xl lg:px-gutter-desktop">
      <h1 className="font-display text-headline-md">Project not found</h1>
      <p className="text-body-md text-on-surface-variant">It may have been deleted, or it was saved in another browser.</p>
      <Link href="/" className={buttonClasses("primary")}>
        Go to home
      </Link>
    </div>
  );
}
