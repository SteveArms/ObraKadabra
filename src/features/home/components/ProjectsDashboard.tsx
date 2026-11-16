"use client";

import { useMemo } from "react";
import { PageSection } from "@/components/layout/PageSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProjects } from "../hooks/useProjects";
import { aggregatePortfolio } from "../utils";
import { KeepProjectsForm } from "./KeepProjectsForm";
import { NewPlanBanner } from "./NewPlanBanner";
import { PortfolioKpis } from "./PortfolioKpis";
import { ProjectCard } from "./ProjectCard";
import { ProjectsEmptyState } from "./ProjectsEmptyState";

export function ProjectsDashboard() {
  const state = useProjects();
  const projects = useMemo(() => (state.status === "ready" ? state.projects : []), [state]);
  const summaries = useMemo(() => projects.map((item) => item.summary), [projects]);

  return (
    <PageSection labelledBy="projects-title">
      <SectionHeading id="projects-title" overline="Dashboard" icon="folder_managed" title="My active projects" />
      <div aria-busy={state.status === "loading"} className="min-h-24">
        {state.status === "loading" ? (
          <div data-testid="projects-loading" className="grid grid-cols-1 gap-space-lg md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-60 rounded-lg md:h-54" />
            <Skeleton className="h-54 rounded-lg max-md:hidden" />
          </div>
        ) : null}
        {state.status === "ready" && projects.length === 0 ? <ProjectsEmptyState /> : null}
        {projects.length > 0 ? (
          <ul className="grid grid-cols-1 gap-space-lg md:grid-cols-2 xl:grid-cols-3">
            {projects.map(({ project, summary }) => (
              <li key={project.id} className="flex">
                <ProjectCard project={project} summary={summary} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {projects.length > 0 ? <KeepProjectsForm /> : null}
      <NewPlanBanner />
      <PortfolioKpis totals={aggregatePortfolio(summaries)} />
    </PageSection>
  );
}
