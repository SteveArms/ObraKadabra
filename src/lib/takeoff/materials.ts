import { BRICKS_PER_M2, CONCRETE_FC210, CYCLOPEAN_CONCRETE, MORTAR_1_5, MORTAR_M3_PER_M2 } from "@/data/mixes";
import { MATERIAL_WASTE, WASTE_FACTORS } from "@/data/waste";
import type { Material, MaterialQuantity, TakeoffItem, TakeoffLine, Unit } from "@/schemas/takeoff";

type Recipe = Partial<Record<Material, number>>;

const MATERIAL_UNITS: Record<Material, Unit> = { cement: "bag", sand: "m3", gravel: "m3", brick: "unit", rebar: "kg" };

function scaleRecipe(recipe: Recipe, factor: number): Recipe {
  return Object.fromEntries(Object.entries(recipe).map(([material, amount]) => [material, amount * factor]));
}

function withBricks(bricks: number, mortarPerM2: number): Recipe {
  return { brick: bricks, ...scaleRecipe(MORTAR_1_5, mortarPerM2 * (1 + WASTE_FACTORS.mortar)) };
}

// Materials consumed by one unit (m³, m² or kg) of each takeoff item
const RECIPES: Record<TakeoffItem, Recipe> = {
  excavation: {},
  structural_concrete: CONCRETE_FC210,
  cyclopean_concrete: CYCLOPEAN_CONCRETE,
  rebar: { rebar: 1 },
  masonry_load_bearing: withBricks(BRICKS_PER_M2.load_bearing, MORTAR_M3_PER_M2.masonry),
  masonry_partition: withBricks(BRICKS_PER_M2.partition, MORTAR_M3_PER_M2.masonry),
  plaster: scaleRecipe(MORTAR_1_5, MORTAR_M3_PER_M2.plaster * (1 + WASTE_FACTORS.mortar)),
  floor_screed: scaleRecipe(MORTAR_1_5, MORTAR_M3_PER_M2.floor_screed * (1 + WASTE_FACTORS.mortar)),
  light_roofing: {},
};

export function computeMaterials(lines: TakeoffLine[]): MaterialQuantity[] {
  const totals = new Map<Material, number>();
  for (const line of lines) {
    for (const [material, amount] of Object.entries(RECIPES[line.item]) as [Material, number][]) {
      totals.set(material, (totals.get(material) ?? 0) + amount * line.quantity);
    }
  }
  return [...totals].map(([material, quantity]) => ({
    material,
    unit: MATERIAL_UNITS[material],
    quantity: quantity * (1 + (MATERIAL_WASTE[material] ?? 0)),
  }));
}
