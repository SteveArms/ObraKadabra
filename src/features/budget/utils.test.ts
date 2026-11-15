import { describe, expect, it } from "vitest";
import { DEMO_PROJECTS } from "@/lib/projects";
import { scheduleFor, type WeekMaterial } from "@/lib/schedule";
import { whatsappUrl } from "@/lib/whatsapp";
import { costByItem, purchaseCost, purchaseQuantity, shoppingListMessage } from "./utils";

const schedule = scheduleFor(DEMO_PROJECTS[0].floorPlan);

describe("costByItem", () => {
  it("adds up to the schedule total and grows with the weeks", () => {
    const end = costByItem(schedule, schedule.totalWeeks);
    expect(end.reduce((sum, item) => sum + item.total, 0)).toBeCloseTo(schedule.totalCost);
    end.forEach((item) => expect(item.invested).toBeCloseTo(item.total));
    const early = costByItem(schedule, 1);
    expect(early.reduce((sum, item) => sum + item.invested, 0)).toBeLessThan(schedule.totalCost);
    expect(early[0].total).toBeGreaterThanOrEqual(early.at(-1)!.total);
  });
});

describe("shopping list", () => {
  const cement: WeekMaterial = { material: "cement", unit: "bag", quantity: 37.2, cost: 0 };
  const sand: WeekMaterial = { material: "sand", unit: "m3", quantity: 1.23, cost: 0 };

  it("rounds up to what a store sells", () => {
    expect(purchaseQuantity(cement)).toBe(38);
    expect(purchaseQuantity(sand)).toBe(1.3);
    expect(purchaseQuantity({ ...cement, quantity: 38 })).toBe(38);
    expect(purchaseCost(cement)).toBe(38 * 32);
  });

  it("writes a WhatsApp message with every item and the total", () => {
    const message = shoppingListMessage("1-floor house", 8, [cement, sand]);
    expect(message).toContain("week 8");
    expect(message).toContain("38 bags Cement");
    expect(message).toContain("1.3 m³ Coarse sand");
    expect(message).toContain(`Total: S/ ${(38 * 32 + 1.3 * 70).toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
    expect(whatsappUrl(message)).toMatch(/^https:\/\/wa\.me\/\?text=.+38%20bags%20Cement/);
  });
});
