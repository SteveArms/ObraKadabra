"use client";

import { useMemo } from "react";
import { PageSection } from "@/components/layout/PageSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { summarizeProject } from "@/lib/schedule";
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
  const summaries = useMemo(() => projects.map((project) => summarizeProject(project.floorPlan)), [projects]);

  return (
    <PageSection labelledBy="projects-title">
      <SectionHeading id="projects-title" overline="Dashboard" icon="folder_managed" title="My active projects" />
      <div aria-busy={state.status === "loading"} className="min-h-24">
        {state.status === "ready" && projects.length === 0 ? <ProjectsEmptyState /> : null}
        {projects.length > 0 ? (
          <ul className="grid grid-cols-1 gap-space-lg md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <li key={project.id} className="flex">
                <ProjectCard project={project} summary={summaries[index]} />
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
