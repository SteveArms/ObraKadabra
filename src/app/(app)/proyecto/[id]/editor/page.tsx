import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectStatusMessage } from "@/components/layout/ProjectStatusMessage";
import { PlanEditor } from "@/features/plan-editor";
import { DEMO_PROJECTS } from "@/lib/projects";

export const metadata: Metadata = { title: "2D editor" };

export function generateStaticParams() {
  return DEMO_PROJECTS.map((demo) => ({ id: demo.id }));
}

export default function EditorPage({ params }: PageProps<"/proyecto/[id]/editor">) {
  return (
    <Suspense fallback={<ProjectStatusMessage status="loading" />}>
      {params.then(({ id }) => (
        <PlanEditor projectId={id} />
      ))}
    </Suspense>
  );
}
