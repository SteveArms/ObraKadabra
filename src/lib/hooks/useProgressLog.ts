"use client";

import { useCallback, useEffect, useState } from "react";
import { getProjectRepository } from "@/lib/projects";
import type { ProgressEntry } from "@/schemas/progress";

function repository() {
  return getProjectRepository();
}

// Photo logs of one project, newest first; storage failures leave the list empty instead of breaking the page
export function useProgressLog(projectId: string) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);

  const reload = useCallback(async () => {
    const list = await repository()
      .listProgress(projectId)
      .catch(() => []);
    setEntries(list);
  }, [projectId]);

  useEffect(() => {
    let active = true;
    repository()
      .listProgress(projectId)
      .catch(() => [])
      .then((list) => active && setEntries(list));
    return () => {
      active = false;
    };
  }, [projectId]);

  const save = useCallback(
    async (entry: ProgressEntry) => {
      await repository().saveProgress(entry);
      await reload();
    },
    [reload],
  );

  return { entries, save };
}
