import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectWorkspace } from "@/features/workspace";
import { DEMO_PROJECTS } from "@/lib/projects";
import { getDemoModelUrl } from "@/lib/projects/demo-models";

export const metadata: Metadata = { title: "4D/5D workspace" };

export function generateStaticParams() {
  return DEMO_PROJECTS.map((demo) => ({ id: demo.id }));
}

export default function WorkspacePage({ params }: PageProps<"/proyecto/[id]">) {
  return (
    <Suspense fallback={<p className="px-gutter py-space-xl text-body-md lg:px-gutter-desktop">Loading project…</p>}>
      {params.then(({ id }) => (
        <ProjectWorkspace projectId={id} glbUrl={getDemoModelUrl(id)} />
      ))}
    </Suspense>
  );
}
