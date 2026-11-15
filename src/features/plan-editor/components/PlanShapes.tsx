import { formatArea } from "@/lib/format";
import { openingSegment, polygonArea, polygonCentroid } from "@/lib/geometry";
import type { Column, Opening, Room, Wall } from "@/schemas/floor-plan";

export type Tone = "normal" | "pending" | "selected";
type ShapeProps = { scale: number; pixelsPerUnit: number; tone: Tone };

const STROKE: Record<Tone, string> = { normal: "stroke-primary-container", pending: "stroke-status-warning", selected: "stroke-secondary-container" };

// Thin walls stay at least 2 px wide on screen, and every shape keeps a 14 px hit area so it is easy to pick
export function WallShape({ wall, scale, pixelsPerUnit, tone }: ShapeProps & { wall: Wall }) {
  const width = wall.thickness / scale;
  const line = { x1: wall.x1, y1: wall.y1, x2: wall.x2, y2: wall.y2 };
  return (
    <g data-element-type="wall" data-element-id={wall.id} data-testid={`wall-${wall.id}`} data-tone={tone} className="cursor-pointer">
      {tone === "selected" ? <line {...line} strokeWidth={width + 10 / pixelsPerUnit} strokeLinecap="round" className="stroke-secondary-container/30" /> : null}
      <line {...line} strokeWidth={Math.max(width, 2 / pixelsPerUnit)} strokeLinecap="square" className={STROKE[tone]} />
      <line {...line} strokeWidth={Math.max(width, 14 / pixelsPerUnit)} stroke="transparent" />
    </g>
  );
}

export function OpeningShape({ opening, wall, scale, pixelsPerUnit, tone }: ShapeProps & { opening: Opening; wall: Wall }) {
  const cut = openingSegment(wall, opening, scale);
  if (!cut) return null;
  const { start, end } = cut;
  const size = opening.width / scale;
  const unit = { x: (end.x - start.x) / size, y: (end.y - start.y) / size };
  const tip = { x: start.x - unit.y * size, y: start.y + unit.x * size };
  const half = wall.thickness / scale / 4;
  const color = tone === "normal" ? (opening.kind === "door" ? "stroke-status-done" : "stroke-tertiary") : STROKE[tone];
  const hairline = { strokeWidth: (tone === "normal" ? 1.5 : 2.5) / pixelsPerUnit, className: color, fill: "none" };
  return (
    <g data-element-type="opening" data-element-id={opening.id} data-testid={`opening-${opening.id}`} data-tone={tone} className="cursor-pointer">
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeWidth={wall.thickness / scale + 2 / pixelsPerUnit} className="stroke-surface-container-lowest" />
      {opening.kind === "door" ? (
        <>
          <line x1={start.x} y1={start.y} x2={tip.x} y2={tip.y} {...hairline} />
          <path d={`M ${end.x} ${end.y} A ${size} ${size} 0 0 1 ${tip.x} ${tip.y}`} strokeDasharray={`${4 / pixelsPerUnit} ${3 / pixelsPerUnit}`} {...hairline} />
        </>
      ) : (
        [-half, half].map((shift) => <line key={shift} x1={start.x - unit.y * shift} y1={start.y + unit.x * shift} x2={end.x - unit.y * shift} y2={end.y + unit.x * shift} {...hairline} />)
      )}
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeWidth={Math.max(wall.thickness / scale, 14 / pixelsPerUnit)} stroke="transparent" />
    </g>
  );
}

export function ColumnShape({ column, scale, pixelsPerUnit, tone }: ShapeProps & { column: Column }) {
  const [w, d] = [column.w / scale, column.d / scale];
  const hit = Math.max(w, d, 14 / pixelsPerUnit);
  return (
    <g data-element-type="column" data-element-id={column.id} data-testid={`column-${column.id}`} data-tone={tone} className="cursor-pointer">
      <rect x={column.x - w / 2} y={column.y - d / 2} width={w} height={d} strokeWidth={(tone === "normal" ? 1 : 3) / pixelsPerUnit} className={tone === "normal" ? "fill-inverse-surface stroke-inverse-surface" : `fill-inverse-surface ${STROKE[tone]}`} />
      <rect x={column.x - hit / 2} y={column.y - hit / 2} width={hit} height={hit} fill="transparent" />
    </g>
  );
}

export function RoomShape({ room, scale, tone }: Omit<ShapeProps, "pixelsPerUnit"> & { room: Room }) {
  const fill = tone === "selected" ? "fill-secondary-fixed/50" : tone === "pending" ? "fill-status-warning/15" : "fill-primary-fixed/30";
  return (
    <polygon
      data-element-type="room"
      data-element-id={room.id}
      data-testid={`room-${room.id}`}
      data-tone={tone}
      points={room.polygon.map((point) => `${point.x},${point.y}`).join(" ")}
      className={`cursor-pointer transition-[fill] duration-150 ${fill}`}
    >
      <title>{`${room.name} · ${formatArea(polygonArea(room.polygon) * scale ** 2)}`}</title>
    </polygon>
  );
}

// A pill in the canvas color keeps the name readable over the photo; its width is estimated from the text length
export function RoomLabel({ room, scale, pixelsPerUnit }: { room: Room; scale: number; pixelsPerUnit: number }) {
  const center = polygonCentroid(room.polygon);
  const text = `${room.name} · ${formatArea(polygonArea(room.polygon) * scale ** 2)}`;
  const size = 12 / pixelsPerUnit;
  const width = text.length * size * 0.6 + 2 * size;
  return (
    <g className="pointer-events-none">
      <rect x={center.x - width / 2} y={center.y - size} width={width} height={size * 2} rx={size / 2} className="fill-surface-container-lowest/90" />
      <text x={center.x} y={center.y} textAnchor="middle" dominantBaseline="central" fontSize={size} className="fill-primary font-sans font-semibold">
        {text}
      </text>
    </g>
  );
}
