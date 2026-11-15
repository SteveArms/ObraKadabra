import { describe, expect, it } from "vitest";
import { getDemoProject } from "@/lib/projects/demos";
import { scheduleFor } from "@/lib/schedule";
import type { ProgressEntry } from "@/schemas/progress";
import { addWeeks, familySummary, familyTone, latestPhotoEntry, nextCelebration, whatsappShareUrl } from "./utils";

const demo = getDemoProject("casa-1-piso-90");
const schedule = scheduleFor(demo!.floorPlan);

function entry(id: string, recordedAt: string, approved: boolean, status: "done" | "not_started" = "done"): ProgressEntry {
  const finding = { elementId: "C-1", type: "column" as const, status, percent: status === "done" ? 100 : 0, evidence: "", confidence: 0.9 };
  return { id, projectId: "casa-1-piso-90", week: 3, levelLabel: "First floor", recordedAt, approved, hasPhoto: true, findings: [finding] };
}

describe("familyTone", () => {
  it("only claims ahead, on track or behind when photos were approved", () => {
    expect(familyTone(0, 0.1, false)).toBe("not_started");
    expect(familyTone(0.4, 0.4, false)).toBe("planned");
    expect(familyTone(0.45, 0.4, true)).toBe("ahead");
    expect(familyTone(0.41, 0.4, true)).toBe("on_track");
    expect(familyTone(0.3, 0.4, true)).toBe("behind");
    expect(familyTone(1, 0.9, true)).toBe("finished");
  });
});

describe("family summary", () => {
  it("adds calendar weeks to a plan date", () => {
    expect(addWeeks("2026-10-05", 2)).toBe("2026-10-19");
  });

  it("follows the plan when nothing was reported and counts the weeks left", () => {
    const summary = familySummary(schedule, [], 3);
    expect(summary.tone).toBe("planned");
    expect(summary.percent).toBeGreaterThan(0);
    expect(summary.invested).toBeGreaterThan(0);
    expect(summary.weeksLeft).toBe(schedule.totalWeeks - 3);
    expect(familySummary(schedule, [], 0)).toMatchObject({ percent: 0, tone: "not_started", invested: 0 });
  });

  it("uses approved reports only", () => {
    const planned = familySummary(schedule, [], 3).percent;
    expect(familySummary(schedule, [entry("a", "2026-11-01T00:00:00.000Z", false)], 3).percent).toBe(planned);
    expect(familySummary(schedule, [entry("a", "2026-11-01T00:00:00.000Z", true)], 3).percent).toBeGreaterThan(planned);
  });

  it("waits for the next slab pour and shows the latest approved photo", () => {
    expect(nextCelebration(schedule, 1)?.stage).toMatch(/beams_slab|roof/);
    expect(nextCelebration(schedule, schedule.totalWeeks)).toBeUndefined();
    const entries = [entry("old", "2026-11-01T00:00:00.000Z", true), entry("new", "2026-11-02T00:00:00.000Z", true), entry("draft", "2026-11-03T00:00:00.000Z", false)];
    expect(latestPhotoEntry(entries)?.id).toBe("new");
  });
});

describe("whatsappShareUrl", () => {
  it("puts the link inside an encoded message", () => {
    const url = new URL(whatsappShareUrl("https://obrakadabra.app/compartir/abc"));
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toContain("https://obrakadabra.app/compartir/abc");
  });
});
