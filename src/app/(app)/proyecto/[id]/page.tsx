import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { ProjectWorkspace } from "@/features/workspace";
import { DEMO_PROJECTS } from "@/lib/projects";
import { getDemoModelUrl } from "@/lib/projects/demo-models";

export const metadata: Metadata = { title: "4D/5D workspace" };

export function generateStaticParams() {
  return DEMO_PROJECTS.map((demo) => ({ id: demo.id }));
}

export default function WorkspacePage({ params }: PageProps<"/proyecto/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton label="Loading project…" variant="workspace" />}>
      {params.then(({ id }) => (
        <ProjectWorkspace projectId={id} glbUrl={getDemoModelUrl(id)} />
      ))}
    </Suspense>
  );
}
