"use client";

import { useEffect, useState } from "react";
import { getProjectRepository } from "@/lib/projects";
import type { Project } from "@/schemas/project";

// Storage can be blocked (private mode, disabled site data); the dashboard then behaves as if empty
function loadProjects(): Promise<Project[]> {
  try {
    return getProjectRepository().list().catch(() => []);
  } catch {
    return Promise.resolve([]);
  }
}

type ProjectsState = { status: "loading" } | { status: "ready"; projects: Project[] };

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
