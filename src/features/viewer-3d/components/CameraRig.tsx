"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Box3, PerspectiveCamera, Sphere, Vector3, type Camera } from "three";
import { useViewerStore, type ViewMode } from "../store";

type Controls = { target: Vector3; update: () => void };

const VIEW_DIRECTIONS: Record<ViewMode, Vector3> = {
  top: new Vector3(0, 1, 0.0001),
  iso: new Vector3(1, 0.8, 1),
  front: new Vector3(0, 0.25, 1),
};

// Distance that fits the model's bounding sphere inside the narrower of the vertical and horizontal fields of view
function fitDistance(camera: Camera, radius: number): number {
  if (!(camera instanceof PerspectiveCamera)) return radius * 3;
  const vertical = (camera.fov * Math.PI) / 180;
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
  return (radius * 1.15) / Math.sin(Math.min(vertical, horizontal) / 2);
}

function frame(camera: Camera, controls: Controls, box: Box3, view: ViewMode) {
  const { center, radius } = box.getBoundingSphere(new Sphere());
  const distance = fitDistance(camera, radius);
  camera.position.copy(center).add(VIEW_DIRECTIONS[view].clone().normalize().multiplyScalar(distance));
  controls.target.copy(center);
  controls.update();
}

export function CameraRig({ onFramed }: { onFramed: () => void }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const invalidate = useThree((state) => state.invalidate);
  const aspect = useThree((state) => state.size.width / Math.max(state.size.height, 1));
  const entries = useViewerStore((state) => state.entries);
  const view = useViewerStore((state) => state.view);

  useEffect(() => {
    if (!controls || entries.length === 0) return;
    const box = new Box3();
    entries.forEach((entry) => box.expandByObject(entry.object));
    frame(camera, controls, box, view);
    invalidate();
    onFramed();
  }, [camera, controls, entries, view, aspect, invalidate, onFramed]);

  return null;
}
