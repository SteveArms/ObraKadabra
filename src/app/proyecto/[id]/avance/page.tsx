import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectStatusMessage } from "@/components/layout/ProjectStatusMessage";
import { ProgressScreen } from "@/features/progress";
import { DEMO_PROJECTS } from "@/lib/projects";

export const metadata: Metadata = { title: "Log progress" };

export function generateStaticParams() {
  return DEMO_PROJECTS.map((demo) => ({ id: demo.id }));
}

export default function ProgressPage({ params }: PageProps<"/proyecto/[id]/avance">) {
  return (
    <Suspense fallback={<ProjectStatusMessage status="loading" />}>
      {params.then(({ id }) => (
        <ProgressScreen projectId={id} />
      ))}
    </Suspense>
  );
}
