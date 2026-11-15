"use client";

import { useMemo } from "react";
import { actualProgressFrom } from "@/lib/schedule";
import type { ProgressEntry } from "@/schemas/progress";
import type { Project } from "@/schemas/project";
import type { Schedule } from "@/schemas/schedule";
import { useProgressStore } from "../store";
import { expectedElements, levelChoices } from "../utils";

// The chosen level and room, and the elements the photo is checked against there
export function useProgressScope(project: Project, schedule: Schedule, week: number, entries: ProgressEntry[]) {
  const plan = project.floorPlan;
  const choiceId = useProgressStore((state) => state.choiceId);
  const roomId = useProgressStore((state) => state.roomId);
  const choices = useMemo(() => levelChoices(plan.meta.levels), [plan.meta.levels]);
  const choice = choices.find((item) => item.id === choiceId) ?? choices[0];
  const progress = useMemo(() => actualProgressFrom(entries, week), [entries, week]);
  const finished = useMemo(() => new Set(Object.entries(progress?.percents ?? {}).flatMap(([key, percent]) => (percent >= 100 ? [key] : []))), [progress]);
  const expected = useMemo(() => expectedElements(plan, schedule, week, choice, roomId, finished), [plan, schedule, week, choice, roomId, finished]);
  return { choices, choice, roomName: plan.rooms.find((room) => room.id === roomId)?.name, expected, progress };
}

export type ProgressScope = ReturnType<typeof useProgressScope>;
