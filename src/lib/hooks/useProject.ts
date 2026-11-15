"use client";

import { useEffect, useState } from "react";
import { createLocalProjectRepository, getDemoProject } from "@/lib/projects";
import type { Project } from "@/schemas/project";

type ProjectState = { status: "loading" } | { status: "missing" } | { status: "ready"; project: Project };

function initialState(id: string): ProjectState {
  const demo = getDemoProject(id);
  return demo ? { status: "ready", project: demo } : { status: "loading" };
}

async function loadProject(id: string): Promise<Project | undefined> {
  try {
    return await createLocalProjectRepository(window.localStorage).get(id);
  } catch {
    return undefined;
  }
}

// Demos resolve synchronously so their workspace renders on the first paint; saved projects load from storage
export function useProject(id: string): ProjectState {
  const [state, setState] = useState<ProjectState>(() => initialState(id));

  useEffect(() => {
    if (getDemoProject(id)) return;
    let active = true;
    loadProject(id).then((project) => {
      if (active) setState(project ? { status: "ready", project } : { status: "missing" });
    });
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
