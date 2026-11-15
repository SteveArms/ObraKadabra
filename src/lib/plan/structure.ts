import { ISOLATED_FOOTING, ROOF_THICKNESS, SLAB_THICKNESS } from "@/data/structure";
import type { FloorPlan, Footing, Point, Roof, Slab, Wall } from "@/schemas/floor-plan";
import { ID_PREFIX, elementId } from "./ids";

type Shell = Pick<FloorPlan, "meta" | "walls" | "columns">;

// Bounding rectangle of the walls on one floor; the editor refines it when the footprint is not rectangular
export function footprint(walls: Wall[]): Point[] | null {
  if (walls.length === 0) return null;
  const xs = walls.flatMap((wall) => [wall.x1, wall.x2]);
  const ys = walls.flatMap((wall) => [wall.y1, wall.y2]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  if (minX === maxX || minY === maxY) return null;
  return [{ x: minX, y: minY }, { x: maxX, y: minY }, { x: maxX, y: maxY }, { x: minX, y: maxY }];
}

function footingsFor(plan: Shell): Footing[] {
  return plan.columns
    .filter((column) => column.level === 1)
    .map((column, index) => ({ id: elementId(ID_PREFIX.footing, 1, index), x: column.x, y: column.y, ...ISOLATED_FOOTING }));
}

// Every floor below the top gets a slab and the top floor gets the roof, as in the demos
export function deriveStructure(plan: Shell): Pick<FloorPlan, "footings" | "slabs" | "roofs"> {
  const slabs: Slab[] = [];
  const roofs: Roof[] = [];
  for (let level = 1; level <= plan.meta.levels; level++) {
    const polygon = footprint(plan.walls.filter((wall) => wall.level === level));
    if (!polygon) continue;
    if (level < plan.meta.levels) slabs.push({ id: `${ID_PREFIX.slab}${level}`, level, polygon, thickness: SLAB_THICKNESS });
    else roofs.push({ id: `${ID_PREFIX.roof}1`, level, polygon, thickness: ROOF_THICKNESS[plan.meta.roofType] });
  }
  return { footings: footingsFor(plan), slabs, roofs };
}

// After the walls or columns change, footings, slabs and the roof are recomputed from them
export function withDerivedStructure(plan: FloorPlan): FloorPlan {
  return { ...plan, ...deriveStructure(plan) };
}
