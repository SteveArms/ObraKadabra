import type { Tool } from "./types";

export type ToolSpec = { id: Tool; label: string; icon: string; key: string; keyLabel: string; hint: string };

const spec = (id: Tool, label: string, icon: string, keyLabel: string, hint: string): ToolSpec => ({ id, label, icon, key: keyLabel.toLowerCase(), keyLabel, hint });

// Rail order and grouping follow Stitch: pointing tools, drawing tools, then delete
export const TOOL_GROUPS: ToolSpec[][] = [
  [spec("select", "Select", "near_me", "V", "Click an element to see its properties. Drag the empty plan to move around."), spec("vertex", "Move vertex", "open_with", "A", "Drag a corner. It snaps to other corners, to 0/90° and to the grid.")],
  [
    spec("wall", "Draw wall", "view_column", "W", "Click where the wall starts, then where it ends. Press Esc to stop drawing."),
    spec("column", "Column", "crop_square", "C", "Click where the column goes. It snaps to wall corners."),
    spec("door", "Door", "door_front", "D", "Click a wall to put a 0.90 m door there."),
    spec("window", "Window", "window", "N", "Click a wall to put a 1.20 m window there."),
    spec("room", "Room", "pentagon", "R", "Click each corner of the room. Click the first corner or press Enter to close it."),
    spec("measure", "Measure", "straighten", "M", "Click two points to measure the distance between them."),
  ],
  [{ ...spec("delete", "Delete", "delete", "Del", "Click an element to delete it."), key: "delete" }],
];

export const TOOLS = TOOL_GROUPS.flat();

export const CALIBRATE_HINT = "Click two points whose real distance you know, such as the ends of a dimension line.";

export function toolHint(tool: Tool): string {
  return TOOLS.find((item) => item.id === tool)?.hint ?? CALIBRATE_HINT;
}

export function toolForKey(key: string): Tool | undefined {
  const lower = key.toLowerCase();
  return TOOLS.find((item) => item.key === lower && item.id !== "delete")?.id;
}
