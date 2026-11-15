import { DEFAULT_COLUMN } from "@/data/structure";
import { formatMeters } from "@/lib/format";
import { length } from "@/lib/geometry";
import type { Point } from "@/schemas/floor-plan";
import { useEditorStore } from "../store";

type DraftLayerProps = { scale: number; pixelsPerUnit: number };

function Measure({ a, b, scale, pixelsPerUnit }: { a: Point; b: Point; scale: number; pixelsPerUnit: number }) {
  const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return (
    <>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={2 / pixelsPerUnit} strokeDasharray={`${6 / pixelsPerUnit} ${4 / pixelsPerUnit}`} className="stroke-secondary" />
      <text x={middle.x} y={middle.y - 8 / pixelsPerUnit} textAnchor="middle" fontSize={12 / pixelsPerUnit} strokeWidth={4 / pixelsPerUnit} paintOrder="stroke" className="fill-secondary stroke-surface-container-lowest font-mono font-semibold" data-testid="draft-length">
        {formatMeters(length(a, b) * scale)}
      </text>
    </>
  );
}

// What is being drawn and not yet committed: the next wall, the room outline, a measurement or calibration points
export function DraftLayer({ scale, pixelsPerUnit }: DraftLayerProps) {
  const tool = useEditorStore((state) => state.tool);
  const draft = useEditorStore((state) => state.draft);
  const cursor = useEditorStore((state) => state.cursor);
  const dot = 4 / pixelsPerUnit;
  const pair = draft.length >= 2 ? draft.slice(0, 2) : cursor && draft[0] ? [draft[0], cursor] : [];
  const last = draft.at(-1);
  return (
    <g className="pointer-events-none" data-testid="draft-layer">
      {tool === "column" && cursor ? <rect x={cursor.x - DEFAULT_COLUMN.w / scale / 2} y={cursor.y - DEFAULT_COLUMN.d / scale / 2} width={DEFAULT_COLUMN.w / scale} height={DEFAULT_COLUMN.d / scale} className="fill-inverse-surface/40" /> : null}
      {tool === "room" && draft.length > 0 ? <polyline points={[...draft, ...(cursor ? [cursor] : [])].map((p) => `${p.x},${p.y}`).join(" ")} fill="none" strokeWidth={2 / pixelsPerUnit} className="stroke-primary-container" /> : null}
      {tool === "wall" && last && cursor ? <Measure a={last} b={cursor} scale={scale} pixelsPerUnit={pixelsPerUnit} /> : null}
      {(tool === "measure" || tool === "calibrate") && pair.length === 2 ? <Measure a={pair[0]} b={pair[1]} scale={scale} pixelsPerUnit={pixelsPerUnit} /> : null}
      {draft.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={dot} className="fill-secondary-container stroke-surface-container-lowest" strokeWidth={1.5 / pixelsPerUnit} />
      ))}
    </g>
  );
}
