import type { FloorPlan } from "@/schemas/floor-plan";
import { planVertices } from "../vertices";

export function VertexHandles({ plan, level, pixelsPerUnit }: { plan: FloorPlan; level: number; pixelsPerUnit: number }) {
  const size = 10 / pixelsPerUnit;
  const hit = 20 / pixelsPerUnit;
  return (
    <g data-testid="vertex-handles">
      {planVertices(plan, level).map(({ id, point }) => (
        <g key={id} data-testid={`vertex-${id}`} data-vertex-x={point.x} data-vertex-y={point.y} className="cursor-move">
          <rect x={point.x - hit / 2} y={point.y - hit / 2} width={hit} height={hit} fill="transparent" />
          <rect x={point.x - size / 2} y={point.y - size / 2} width={size} height={size} strokeWidth={1.5 / pixelsPerUnit} className="fill-surface-container-lowest stroke-inverse-surface" />
        </g>
      ))}
    </g>
  );
}
