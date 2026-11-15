"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Viewer } from "@/features/viewer-3d";
import type { FloorPlan } from "@/schemas/floor-plan";
import { useProgressStore } from "../store";
import { planForFindings } from "../utils";

// The photo beside the same 3D viewer as the workspace, reduced to the elements the AI found in it
export function BeforeAfter({ plan }: { plan: FloorPlan }) {
  const photo = useProgressStore((state) => state.photo);
  const findings = useProgressStore((state) => state.findings);
  const subset = useMemo(() => planForFindings(plan, findings), [plan, findings]);
  if (!photo || findings.length === 0) return null;
  return (
    <section aria-labelledby="before-after-title" className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-float">
      <h2 id="before-after-title" className="font-display text-headline-sm">
        Before vs after
      </h2>
      <p className="text-body-sm text-on-surface-variant">The photo next to the elements it updates in the 3D model.</p>
      <div className="grid gap-space-sm sm:grid-cols-2">
        <figure className="flex flex-col gap-1">
          <figcaption className="text-body-sm text-on-surface-variant">Site photo</figcaption>
          <Image src={photo.url} alt="Site photo" width={1600} height={1067} unoptimized className="h-48 w-full rounded-md object-cover outline-1 -outline-offset-1 outline-black/10" />
        </figure>
        <figure className="flex flex-col gap-1">
          <figcaption className="text-body-sm text-on-surface-variant">3D model, elements found</figcaption>
          <Viewer plan={subset} compact className="h-48 rounded-md" />
        </figure>
      </div>
    </section>
  );
}
