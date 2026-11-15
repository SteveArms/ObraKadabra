import { describe, expect, it } from "vitest";
import { getDemoProject } from "@/lib/projects/demos";
import { scheduleFor } from "@/lib/schedule";
import { buildReport } from "./report";

const project = getDemoProject("casa-1-piso-90")!;
const schedule = scheduleFor(project.floorPlan);
const generatedAt = new Date("2026-11-15T12:00:00Z");

describe("buildReport", () => {
  it("names the file after the project and the week", () => {
    expect(buildReport({ project, schedule, week: 3, generatedAt }).fileName).toBe("obrakadabra-1-floor-house-90-m-week-3.pdf");
    expect(buildReport({ project: { ...project, name: "Casa Ñaña / José" }, schedule, week: 1, generatedAt }).fileName).toBe("obrakadabra-casa-nana-jose-week-1.pdf");
  });

  it("summarizes the project and lists every work item with the budget total", () => {
    const report = buildReport({ project, schedule, week: 3, generatedAt });
    expect(report.subtitle).toContain("Week 3 of");
    expect(report.subtitle).toContain("2026-11-15");
    expect(report.facts.map(([label]) => label)).toContain("Shell budget");
    expect(report.facts.some(([label]) => label === "Reported progress")).toBe(false);
    const [items, materials] = report.tables;
    expect(items.rows.length).toBeGreaterThan(3);
    expect(materials.title).toBe("Materials to buy for week 3");
    expect(materials.rows.every((row) => row[2].startsWith("S/"))).toBe(true);
  });

  it("adds the reported progress when photos were approved", () => {
    const report = buildReport({ project, schedule, week: 3, progress: { week: 3, percents: { "column_C-1": 100 } }, generatedAt });
    expect(report.facts.at(-1)?.[0]).toBe("Reported progress");
  });
});
