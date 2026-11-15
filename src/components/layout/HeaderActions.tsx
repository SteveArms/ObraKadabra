"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import { projectIdFromPath } from "@/lib/navigation";

function Actions({ projectId }: { projectId: string }) {
  return (
    <>
      <Link href={`/proyecto/${projectId}/avance`} data-testid="header-log-progress" className={buttonClasses("milestone")}>
        <Icon name="photo_camera" />
        <span className="sr-only md:not-sr-only">Log progress</span>
      </Link>
      <Link href={`/compartir/${projectId}`} data-testid="header-share" className={buttonClasses("ghost")}>
        <Icon name="share" />
        <span className="sr-only md:not-sr-only">Share</span>
      </Link>
    </>
  );
}

function CurrentProjectActions() {
  return <Actions projectId={projectIdFromPath(usePathname()) ?? DEFAULT_PROJECT_ID} />;
}

// The pathname only exists at request time, so the static shell links to the default project until it resolves
export function HeaderActions() {
  return (
    <Suspense fallback={<Actions projectId={DEFAULT_PROJECT_ID} />}>
      <CurrentProjectActions />
    </Suspense>
  );
}
