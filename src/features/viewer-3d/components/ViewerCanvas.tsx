"use client";

import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Suspense } from "react";
import { MOUSE, TOUCH } from "three";
import type { FloorPlan } from "@/schemas/floor-plan";
import { cssColor } from "../hooks/css-color";
import { useStatusMaterials } from "../hooks/useStatusMaterials";
import { findElementKey } from "../scene";
import { useViewerStore, type NavMode } from "../store";
import { CameraRig } from "./CameraRig";
import { GlbBoundary } from "./GlbBoundary";
import { ElementSync } from "./ElementSync";
import { ModelFromGlb } from "./ModelFromGlb";
import { ModelFromPlan } from "./ModelFromPlan";

const LEFT_BUTTON: Record<NavMode, MOUSE> = { orbit: MOUSE.ROTATE, pan: MOUSE.PAN, zoom: MOUSE.DOLLY };
const ONE_FINGER: Record<NavMode, TOUCH> = { orbit: TOUCH.ROTATE, pan: TOUCH.PAN, zoom: TOUCH.DOLLY_PAN };

type ViewerCanvasProps = { plan: FloorPlan; glbUrl?: string; onReady: () => void };

function Model({ plan, glbUrl }: Omit<ViewerCanvasProps, "onReady">) {
  const materials = useStatusMaterials();
  const select = useViewerStore((state) => state.select);
  const setHover = useViewerStore((state) => state.setHover);
  const glbIssue = useViewerStore((state) => state.glbIssue);
  const rejectGlb = useViewerStore((state) => state.rejectGlb);
  const useGlb = Boolean(glbUrl) && !glbIssue;

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    select(findElementKey(event.object, event.instanceId));
  };
  const handleMove = (event: ThreeEvent<PointerEvent>) => setHover({ x: event.point.x, y: event.point.y, z: event.point.z });

  return (
    <group onClick={handleClick} onPointerMove={handleMove} onPointerOut={() => setHover(undefined)}>
      {useGlb && glbUrl ? (
        <GlbBoundary onError={() => rejectGlb("load_failed")}>
          <Suspense fallback={null}>
            <ModelFromGlb url={glbUrl} plan={plan} />
          </Suspense>
        </GlbBoundary>
      ) : (
        <ModelFromPlan plan={plan} materials={materials} />
      )}
      <ElementSync materials={materials} />
    </group>
  );
}

export default function ViewerCanvas({ plan, glbUrl, onReady }: ViewerCanvasProps) {
  const navMode = useViewerStore((state) => state.navMode);
  return (
    <Canvas frameloop="demand" dpr={[1, 2]} camera={{ fov: 40, near: 0.1, far: 500, position: [20, 16, 20] }} gl={{ alpha: true }}>
      <hemisphereLight args={["#ffffff", "#3a3d44", 1.4]} />
      <directionalLight position={[12, 20, 8]} intensity={1.6} />
      <Suspense fallback={null}>
        <Model plan={plan} glbUrl={glbUrl} />
      </Suspense>
      <Grid
        position={[0, -0.01, 0]}
        infiniteGrid
        cellSize={1}
        sectionSize={5}
        cellColor={cssColor("--color-viewport-line")}
        sectionColor={cssColor("--color-viewport-line-strong")}
        fadeDistance={60}
      />
      <OrbitControls
        makeDefault
        mouseButtons={{ LEFT: LEFT_BUTTON[navMode], MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
        touches={{ ONE: ONE_FINGER[navMode], TWO: TOUCH.DOLLY_PAN }}
        maxPolarAngle={Math.PI * 0.55}
      />
      <CameraRig onFramed={onReady} />
    </Canvas>
  );
}
