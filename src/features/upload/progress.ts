import { formatArea, formatCount, formatSoles } from "@/lib/format";
import { PlanStreamEventSchema, PROCESSING_STEPS, type PlanStreamEvent, type ProcessingStep } from "@/schemas/plan-extraction";

export type StepStatus = "queued" | "active" | "done";
export type Progress = { done: ProcessingStep[]; counts: Partial<Record<ProcessingStep, Record<string, number>>>; names: string[] };

export const EMPTY_PROGRESS: Progress = { done: [], counts: {}, names: [] };

export const STEP_LABELS: Record<ProcessingStep, string> = {
  reading: "Reading the plan",
  walls: "Detecting load-bearing walls and partitions",
  openings: "Finding doors and windows",
  rooms: "Identifying rooms",
  volumetry: "Building the 3D model and the budget in S/",
};

// Shown while a step runs; reading is the slow one because the model looks at the whole photo
export const ACTIVE_HINTS: Partial<Record<ProcessingStep, string>> = {
  reading: "The AI is looking at your photo. This can take up to a minute.",
};

// Splits a growing NDJSON buffer into validated events plus the unfinished tail
export function readEvents(buffer: string): { events: PlanStreamEvent[]; rest: string } {
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? "";
  const events = lines.flatMap((line) => {
    if (!line.trim()) return [];
    try {
      const parsed = PlanStreamEventSchema.safeParse(JSON.parse(line));
      return parsed.success ? [parsed.data] : [];
    } catch {
      return [];
    }
  });
  return { events, rest };
}

function add(total: Record<string, number> = {}, extra: Record<string, number> = {}): Record<string, number> {
  const sum = { ...total };
  for (const [key, value] of Object.entries(extra)) sum[key] = (sum[key] ?? 0) + value;
  return sum;
}

// Counts add up across floors; a step only shows as done once the last floor reports it
export function applyStep(progress: Progress, step: ProcessingStep, counts: Record<string, number> | undefined, isLastSheet: boolean, names: string[] = []): Progress {
  return {
    done: isLastSheet && !progress.done.includes(step) ? [...progress.done, step] : progress.done,
    counts: { ...progress.counts, [step]: add(progress.counts[step], counts) },
    names: [...progress.names, ...names],
  };
}

export function stepStatus(progress: Progress, step: ProcessingStep, failed: boolean): StepStatus {
  if (progress.done.includes(step)) return "done";
  const next = PROCESSING_STEPS.find((candidate) => !progress.done.includes(candidate));
  return next === step && !failed ? "active" : "queued";
}

export function stepDetail(progress: Progress, step: ProcessingStep): string | null {
  const counts = progress.counts[step];
  if (!counts || !progress.done.includes(step)) return null;
  const n = (key: string) => counts[key] ?? 0;
  switch (step) {
    case "reading":
      return n("dimensions") > 0 ? `${formatCount(n("dimensions"), "dimension line", "dimension lines")} read on the plan.` : "No dimension lines were legible; your calibration sets the scale.";
    case "walls":
      return `${formatCount(n("total"), "wall", "walls")} found: ${n("loadBearing")} load-bearing and ${n("partition")} partition.`;
    case "openings":
      return `${formatCount(n("doors"), "door", "doors")} and ${formatCount(n("windows"), "window", "windows")}.`;
    case "rooms":
      return progress.names.length > 0 ? progress.names.join(", ") : formatCount(n("total"), "room", "rooms");
    case "volumetry":
      return `${formatArea(n("builtArea"))} built · ${formatSoles(n("cost"))} shell budget.`;
  }
}
