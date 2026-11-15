import { FOUNDATION_DEPTH, REBAR_KG_PER_M3, SLAB_CONCRETE_M3_PER_M2, SLAB_REBAR_KG_PER_M2, CONFINING_BEAM, STRIP_FOOTING } from "@/data/structure";
import { polygonArea, volume, wallLength } from "@/lib/geometry";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { TakeoffLine } from "@/schemas/takeoff";
import { makeLine } from "./line";

export function foundationLines(plan: FloorPlan): TakeoffLine[] {
  const footings = plan.footings.flatMap((footing) => {
    const concrete = volume(footing.w, footing.d, footing.depth);
    return [
      makeLine("footing", footing.id, "foundation", "excavation", volume(footing.w, footing.d, FOUNDATION_DEPTH)),
      makeLine("footing", footing.id, "foundation", "structural_concrete", concrete),
      makeLine("footing", footing.id, "foundation", "rebar", concrete * REBAR_KG_PER_M3.footing),
    ];
  });
  // Strip footings run under every ground-floor load-bearing wall
  const strips = plan.walls
    .filter((wall) => wall.level === 1 && wall.kind === "load_bearing")
    .flatMap((wall) => {
      const trench = volume(STRIP_FOOTING.width, STRIP_FOOTING.depth, wallLength(wall) * plan.meta.scale);
      return [
        makeLine("footing", wall.id, "foundation", "excavation", trench),
        makeLine("footing", wall.id, "foundation", "cyclopean_concrete", trench),
      ];
    });
  return [...footings, ...strips];
}

export function columnLines(plan: FloorPlan): TakeoffLine[] {
  return plan.columns.flatMap((column) => {
    const concrete = volume(column.w, column.d, plan.meta.floorHeight);
    return [
      makeLine("column", column.id, "columns", "structural_concrete", concrete),
      makeLine("column", column.id, "columns", "rebar", concrete * REBAR_KG_PER_M3.column),
    ];
  });
}

export function beamAndSlabLines(plan: FloorPlan): TakeoffLine[] {
  const beams = plan.walls
    .filter((wall) => wall.kind === "load_bearing")
    .flatMap((wall) => {
      const concrete = volume(CONFINING_BEAM.width, CONFINING_BEAM.height, wallLength(wall) * plan.meta.scale);
      return [
        makeLine("beam", wall.id, "beams_slab", "structural_concrete", concrete),
        makeLine("beam", wall.id, "beams_slab", "rebar", concrete * REBAR_KG_PER_M3.beam),
      ];
    });
  const slabs = plan.slabs.flatMap((slab) => {
    const surface = polygonArea(slab.polygon) * plan.meta.scale ** 2;
    return [
      makeLine("slab", slab.id, "beams_slab", "structural_concrete", surface * SLAB_CONCRETE_M3_PER_M2),
      makeLine("slab", slab.id, "beams_slab", "rebar", surface * SLAB_REBAR_KG_PER_M2),
    ];
  });
  return [...beams, ...slabs];
}

export function roofLines(plan: FloorPlan): TakeoffLine[] {
  return plan.roofs.flatMap((roof) => {
    const surface = polygonArea(roof.polygon) * plan.meta.scale ** 2;
    if (plan.meta.roofType === "metal_sheet") return [makeLine("roof", roof.id, "roof", "light_roofing", surface)];
    return [
      makeLine("roof", roof.id, "roof", "structural_concrete", surface * SLAB_CONCRETE_M3_PER_M2),
      makeLine("roof", roof.id, "roof", "rebar", surface * SLAB_REBAR_KG_PER_M2),
    ];
  });
}
