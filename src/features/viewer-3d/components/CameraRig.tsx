"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Box3, PerspectiveCamera, Sphere, Vector3, type Camera } from "three";
import { useViewerStore, type OverlayInsets, type ViewMode } from "../store";

type Controls = { target: Vector3; update: () => void };

const VIEW_DIRECTIONS: Record<ViewMode, Vector3> = {
  top: new Vector3(0, 1, 0.0001),
  iso: new Vector3(1, 0.8, 1),
  front: new Vector3(0, 0.25, 1),
};

type Viewport = { width: number; height: number; insets: OverlayInsets };

// The free band between the overlays, never less than half the canvas so a crowded phone still shows the model
function freeBand({ height, insets }: Viewport) {
  const band = Math.max(height - insets.top - insets.bottom, height * 0.5);
  return { share: band / height, shift: (insets.top - insets.bottom) / 2 };
}

// Distance that fits the model's bounding sphere inside the narrower of the free vertical band and the horizontal view
function fitDistance(camera: PerspectiveCamera, radius: number, share: number): number {
  const vertical = 2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * share);
  const horizontal = 2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
  // A box seen at an angle covers about 80% of its bounding sphere, so 0.9 still leaves a margin around the house
  return (radius * 0.9) / Math.sin(Math.min(vertical, horizontal) / 2);
}

// The view offset slides the image down so the model's center sits in the middle of the free band
function frame(camera: Camera, controls: Controls, box: Box3, view: ViewMode, viewport: Viewport) {
  if (!(camera instanceof PerspectiveCamera)) return;
  const { center, radius } = box.getBoundingSphere(new Sphere());
  const { share, shift } = freeBand(viewport);
  camera.setViewOffset(viewport.width, viewport.height, 0, -shift, viewport.width, viewport.height);
  const distance = fitDistance(camera, radius, share);
  camera.position.copy(center).add(VIEW_DIRECTIONS[view].clone().normalize().multiplyScalar(distance));
  controls.target.copy(center);
  controls.update();
}

export function CameraRig({ onFramed }: { onFramed: () => void }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const invalidate = useThree((state) => state.invalidate);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const insets = useViewerStore((state) => state.insets);
  const entries = useViewerStore((state) => state.entries);
  const view = useViewerStore((state) => state.view);

  useEffect(() => {
    if (!controls || entries.length === 0) return;
    const box = new Box3();
    entries.forEach((entry) => box.expandByObject(entry.object));
    frame(camera, controls, box, view, { width, height: Math.max(height, 1), insets });
    invalidate();
    onFramed();
  }, [camera, controls, entries, view, width, height, insets, invalidate, onFramed]);

  return null;
}
