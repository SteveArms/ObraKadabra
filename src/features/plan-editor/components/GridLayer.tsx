import type { Bounds } from "../types";
import { GRID_METERS } from "../constants";

// The 0.05 m grid only shows once its cells are at least 6 px apart; the 1 m grid is always there
export function GridLayer({ bounds, scale, pixelsPerUnit }: { bounds: Bounds; scale: number; pixelsPerUnit: number }) {
  const minor = GRID_METERS / scale;
  const major = 1 / scale;
  const line = 1 / pixelsPerUnit;
  const showMinor = minor * pixelsPerUnit >= 6;
  return (
    <g aria-hidden="true" className="pointer-events-none">
      <defs>
        <pattern id="editor-grid-minor" width={minor} height={minor} patternUnits="userSpaceOnUse">
          <path d={`M ${minor} 0 L 0 0 0 ${minor}`} fill="none" strokeWidth={line} className="stroke-outline-variant/40" />
        </pattern>
        <pattern id="editor-grid-major" width={major} height={major} patternUnits="userSpaceOnUse">
          <path d={`M ${major} 0 L 0 0 0 ${major}`} fill="none" strokeWidth={line} className="stroke-outline-variant" />
        </pattern>
      </defs>
      {showMinor ? <rect x={bounds.x} y={bounds.y} width={bounds.w} height={bounds.h} fill="url(#editor-grid-minor)" /> : null}
      <rect x={bounds.x} y={bounds.y} width={bounds.w} height={bounds.h} fill="url(#editor-grid-major)" />
    </g>
  );
}
