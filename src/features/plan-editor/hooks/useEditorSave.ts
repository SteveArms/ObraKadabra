"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pendingElements, withDerivedStructure } from "@/lib/plan";
import { createLocalProjectRepository, isDemoId } from "@/lib/projects";
import type { Project } from "@/schemas/project";
import { useEditorStore } from "../store";

export type ExitDialog = "build" | "discard" | null;

const SAVE_ERROR = "Unable to save the project. Check that this browser allows site storage, then try again.";

// Demos are read-only, so leaving their editor shows the demo as it ships
export function useEditorSave(project: Project) {
  const router = useRouter();
  const [dialog, setDialog] = useState<ExitDialog>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const readOnly = isDemoId(project.id);

  const build = async () => {
    const { plan } = useEditorStore.getState();
    if (!plan) return;
    setDialog(null);
    setSaving(true);
    try {
      if (!readOnly) {
        const floorPlan = withDerivedStructure(plan);
        await createLocalProjectRepository(window.localStorage).save({ ...project, floorPlan, status: "ready", updatedAt: new Date().toISOString() });
      }
      router.push(`/proyecto/${project.id}`);
    } catch {
      setError(SAVE_ERROR);
    } finally {
      // The router keeps this page alive for the back button, so the button must be usable again on return
      setSaving(false);
    }
  };

  const requestBuild = () => {
    const { plan } = useEditorStore.getState();
    if (plan && pendingElements(plan).length > 0) setDialog("build");
    else void build();
  };

  const requestDiscard = () => {
    if (useEditorStore.getState().past.length > 0) setDialog("discard");
    else router.push("/");
  };

  return { readOnly, dialog, error, saving, build, requestBuild, requestDiscard, discard: () => router.push("/"), closeDialog: () => setDialog(null) };
}
