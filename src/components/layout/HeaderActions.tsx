"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ShareButton } from "@/features/share-link";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import { projectIdFromPath } from "@/lib/navigation";

function Actions({ projectId }: { projectId: string }) {
  return (
    <>
      <Link href={`/proyecto/${projectId}/avance`} data-testid="header-log-progress" className={buttonClasses("milestone")}>
        <Icon name="photo_camera" />
        <span className="sr-only md:not-sr-only">Log progress</span>
      </Link>
      <ShareButton projectId={projectId} />
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
