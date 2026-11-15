import type { FloorPlan } from "@/schemas/floor-plan";
import type { ElementRef } from "../types";
import { ColumnShape, OpeningShape, RoomLabel, RoomShape, WallShape, type Tone } from "./PlanShapes";

type PlanDrawingProps = { plan: FloorPlan; level: number; pixelsPerUnit: number; pendingIds: Set<string>; selected?: ElementRef };

// Painter's order: rooms under walls, openings cut the walls, columns on top, then the room labels
export function PlanDrawing({ plan, level, pixelsPerUnit, pendingIds, selected }: PlanDrawingProps) {
  const scale = plan.meta.scale;
  const tone = (id: string): Tone => (selected?.id === id ? "selected" : pendingIds.has(id) ? "pending" : "normal");
  const walls = plan.walls.filter((wall) => wall.level === level);
  const rooms = plan.rooms.filter((room) => room.level === level);
  const shape = { scale, pixelsPerUnit };
  return (
    <>
      {rooms.map((room) => (
        <RoomShape key={room.id} room={room} scale={scale} tone={tone(room.id)} />
      ))}
      {walls.map((wall) => (
        <WallShape key={wall.id} wall={wall} tone={tone(wall.id)} {...shape} />
      ))}
      {plan.openings.map((opening) => {
        const wall = walls.find((item) => item.id === opening.wallId);
        return wall ? <OpeningShape key={opening.id} opening={opening} wall={wall} tone={tone(opening.id)} {...shape} /> : null;
      })}
      {plan.columns
        .filter((column) => column.level === level)
        .map((column) => (
          <ColumnShape key={column.id} column={column} tone={tone(column.id)} {...shape} />
        ))}
      {rooms.map((room) => (
        <RoomLabel key={room.id} room={room} {...shape} />
      ))}
    </>
  );
}
