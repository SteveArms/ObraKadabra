import { WORKDAYS_PER_WEEK, YIELDS_PER_CREW_DAY } from "@/data/yields";
import { STAGES } from "@/schemas/schedule";
import type { TakeoffLine } from "@/schemas/takeoff";

export function crewDays(lines: TakeoffLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity / YIELDS_PER_CREW_DAY[line.item], 0);
}

// TODO: replace with the stage schedule from features/schedule in phase 3
export function estimateDurationWeeks(lines: TakeoffLine[]): number {
  return STAGES.reduce((weeks, stage) => {
    const days = crewDays(lines.filter((line) => line.stage === stage));
    return weeks + Math.ceil(days / WORKDAYS_PER_WEEK);
  }, 0);
}
