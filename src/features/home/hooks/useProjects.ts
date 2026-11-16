"use client";

import { useEffect, useState } from "react";
import type { ProjectSummary } from "@/lib/schedule";
import type { Project } from "@/schemas/project";

export type ProjectWithSummary = { project: Project; summary: ProjectSummary };

// Storage and the takeoff math load after the page is interactive; blocked storage (private mode) reads as no projects
async function loadProjects(): Promise<ProjectWithSummary[]> {
  try {
    const [{ getProjectRepository }, { summarizeProject }] = await Promise.all([import("@/lib/projects"), import("@/lib/schedule")]);
    const projects = await getProjectRepository().list();
    return projects.map((project) => ({ project, summary: summarizeProject(project.floorPlan) }));
  } catch {
    return [];
  }
}

type ProjectsState = { status: "loading" } | { status: "ready"; projects: ProjectWithSummary[] };

export function useProjects(): ProjectsState {
  const [state, setState] = useState<ProjectsState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    loadProjects().then((projects) => {
      if (active) setState({ status: "ready", projects });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
