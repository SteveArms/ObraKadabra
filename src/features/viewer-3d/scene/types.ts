import type { MeshType } from "@/lib/gltf";

export type Vec3 = [number, number, number];

export type SceneBox = { center: Vec3; size: Vec3; rotationY: number };

export type ScenePrism = { polygon: [number, number][]; bottom: number; thickness: number };

export type SceneShape = { kind: "boxes"; boxes: SceneBox[] } | { kind: "prism"; prism: ScenePrism };

export type SceneElement = {
  key: string;
  id: string;
  type: MeshType;
  level: number;
  shape: SceneShape;
};
