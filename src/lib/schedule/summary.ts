import { computeTakeoffLines, summarizeTakeoff, type TakeoffSummary } from "@/lib/takeoff";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { Schedule } from "@/schemas/schedule";
import { buildSchedule } from "./build";

export type ProjectSummary = TakeoffSummary & { durationWeeks: number };

export function scheduleFor(plan: FloorPlan): Schedule {
  return buildSchedule(plan, computeTakeoffLines(plan));
}

export function summarizeProject(plan: FloorPlan): ProjectSummary {
  return { ...summarizeTakeoff(plan), durationWeeks: scheduleFor(plan).totalWeeks };
}
