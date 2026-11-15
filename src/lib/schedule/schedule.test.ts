import { describe, expect, it } from "vitest";
import { MATERIAL_PRICES } from "@/data/prices";
import { WORKDAYS_PER_WEEK, YIELDS_PER_CREW_DAY } from "@/data/yields";
import { DEMO_PROJECTS } from "@/lib/projects";
import { computeCost, computeMaterials, computeTakeoffLines } from "@/lib/takeoff";
import { makeTestPlan } from "@/lib/takeoff/test-plan";
import { buildSchedule, costCurve, materialsForWeek, plasteredAt, statusAt, summarizeProject } from "./index";

describe.each(DEMO_PROJECTS)("buildSchedule for $id", ({ floorPlan: plan }) => {
  const lines = computeTakeoffLines(plan);
  const schedule = buildSchedule(plan, lines);
  const meshTask = (prefix: string) => schedule.tasks.filter((task) => task.meshKey?.startsWith(prefix));

  it("never starts a column before the foundation is finished", () => {
    const foundationEnd = Math.max(...schedule.tasks.filter((task) => task.stage === "foundation").map((task) => task.endDay));
    for (const column of meshTask("column_")) expect(column.startDay).toBeGreaterThanOrEqual(foundationEnd);
  });

  it("pours each floor's columns only after its walls are up, and its beams after its columns", () => {
    const end = (prefix: string, level: number) => Math.max(...meshTask(prefix).filter((task) => task.level === level).map((task) => task.endDay));
    const start = (prefix: string, level: number) => Math.min(...meshTask(prefix).filter((task) => task.level === level).map((task) => task.startDay));
    for (let level = 1; level <= plan.meta.levels; level++) {
      expect(start("column_", level)).toBeGreaterThanOrEqual(end("wall_", level));
      const beams = schedule.tasks.filter((task) => task.stage === "beams_slab" && task.level === level);
      for (const beam of beams) expect(beam.startDay).toBeGreaterThanOrEqual(end("column_", level));
    }
  });

  it("follows the stage order floor by floor and finishes with the roof and finishes", () => {
    const order = schedule.activities.map((activity) => `${activity.stage}@${activity.level}`);
    expect(order[0]).toBe("foundation@0");
    expect(order.slice(1, 4)).toEqual(["walls@1", "columns@1", "beams_slab@1"]);
    expect(order.indexOf(`beams_slab@${plan.meta.levels}`)).toBeLessThan(order.indexOf(`roof@${plan.meta.levels}`));
    expect(order.at(-1)).toBe(`finishes@${plan.meta.levels}`);
    schedule.activities.slice(1).forEach((activity, index) => expect(activity.startDay).toBeCloseTo(schedule.activities[index].endDay));
  });

  it("makes every activity last its takeoff divided by the yield", () => {
    for (const activity of schedule.activities) {
      const expected = lines
        .filter((line) => schedule.tasks.some((task) => task.stage === activity.stage && task.level === activity.level && task.lines.includes(line)))
        .reduce((sum, line) => sum + line.quantity / YIELDS_PER_CREW_DAY[line.item], 0);
      expect(activity.endDay - activity.startDay).toBeCloseTo(expected);
    }
    expect(schedule.totalWeeks).toBe(Math.ceil(schedule.totalDays / WORKDAYS_PER_WEEK));
  });

  it("schedules every takeoff line once and keeps the total cost", () => {
    expect(schedule.tasks.reduce((sum, task) => sum + task.lines.length, 0)).toBe(lines.length);
    expect(schedule.totalCost).toBeCloseTo(computeCost(lines).total);
  });

  it("draws a monotonic S-curve that ends at the total", () => {
    const curve = costCurve(schedule);
    expect(curve[0].planned).toBe(0);
    curve.slice(1).forEach((point, index) => expect(point.planned).toBeGreaterThanOrEqual(curve[index].planned));
    expect(curve.at(-1)!.planned).toBeCloseTo(computeCost(lines).total);
  });

  it("shows only foundation elements in week 1", () => {
    const started = Object.entries(statusAt(schedule, 1)).filter(([, status]) => status !== "not_started");
    expect(started.length).toBeGreaterThan(0);
    expect(started.every(([key]) => key.startsWith("footing_"))).toBe(true);
  });

  it("buys over the whole schedule exactly the materials of the takeoff", () => {
    const totals = new Map<string, number>();
    for (let week = 1; week <= schedule.totalWeeks; week++) {
      for (const entry of materialsForWeek(schedule, week)) totals.set(entry.material, (totals.get(entry.material) ?? 0) + entry.quantity);
    }
    for (const entry of computeMaterials(lines)) expect(totals.get(entry.material)).toBeCloseTo(entry.quantity, 3);
  });

  it("plasters no wall early on and every wall by the last week", () => {
    expect(plasteredAt(schedule, 1)).toEqual({});
    const finished = plasteredAt(schedule, schedule.totalWeeks);
    expect(Object.keys(finished).sort()).toEqual(plan.walls.map((wall) => `wall_${wall.id}`).sort());
  });

  it("reports the schedule length as the project duration", () => {
    expect(summarizeProject(plan).durationWeeks).toBe(schedule.totalWeeks);
  });
});

describe("small case", () => {
  const plan = makeTestPlan();
  const lines = computeTakeoffLines(plan);
  const schedule = buildSchedule(plan, lines, { crews: 2 });

  it("halves durations with two crews", () => {
    expect(schedule.totalDays).toBeCloseTo(buildSchedule(plan, lines).totalDays / 2);
  });

  it("prices the materials of a week", () => {
    const week = materialsForWeek(schedule, 1);
    for (const entry of week) expect(entry.cost).toBeCloseTo(entry.quantity * MATERIAL_PRICES[entry.material]);
    expect(week.map((entry) => entry.material)).toContain("cement");
  });

  it("marks a task behind the plan as delayed and a reported one as done", () => {
    const footing = schedule.tasks.find((task) => task.meshKey === "footing_Z-1")!;
    const late = Math.max(1, footing.endWeek + 1);
    expect(statusAt(schedule, late, { week: late, percents: { "footing_Z-1": 0 } })["footing_Z-1"]).toBe("delayed");
    expect(statusAt(schedule, late, { week: late, percents: {} })["footing_Z-1"]).toBe("done");
    expect(statusAt(schedule, late, { week: late, percents: { "footing_Z-1": 100 } })["footing_Z-1"]).toBe("done");
    const demo = buildSchedule(DEMO_PROJECTS[0].floorPlan, computeTakeoffLines(DEMO_PROJECTS[0].floorPlan));
    expect(statusAt(demo, 1, { week: 1, percents: { "column_C-1": 40 } })["column_C-1"]).toBe("in_progress");
    expect(statusAt(schedule, 1, { week: 1, percents: { "column_C-1": 40 } })["column_C-1"]).toBe("delayed");
  });
});
