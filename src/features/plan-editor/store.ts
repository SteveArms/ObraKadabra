import { create } from "zustand";
import type { FloorPlan, Point } from "@/schemas/floor-plan";
import { HISTORY_LIMIT } from "./constants";
import type { ElementRef, LayerMode, Tool } from "./types";
import { elementAnchor, elementLevel } from "./utils";

type EditorState = {
  projectId?: string;
  plan?: FloorPlan;
  past: FloorPlan[];
  future: FloorPlan[];
  level: number;
  tool: Tool;
  selected?: ElementRef;
  layers: LayerMode;
  opacity: number;
  draft: Point[];
  cursor?: Point;
  centerOn?: (point: Point) => void;
  load: (projectId: string, plan: FloorPlan) => void;
  commit: (change: (plan: FloorPlan) => FloorPlan) => void;
  checkpoint: () => void;
  dropCheckpoint: () => void;
  preview: (plan: FloorPlan) => void;
  undo: () => void;
  redo: () => void;
  select: (ref?: ElementRef) => void;
  focus: (ref: ElementRef) => void;
  setCenterOn: (centerOn?: (point: Point) => void) => void;
  setTool: (tool: Tool) => void;
  setLayers: (layers: LayerMode) => void;
  setOpacity: (opacity: number) => void;
  setLevel: (level: number) => void;
  setDraft: (draft: Point[]) => void;
  setCursor: (cursor?: Point) => void;
};

const NO_DRAFT = { draft: [], cursor: undefined };
const INITIAL = { past: [], future: [], level: 1, tool: "select" as Tool, selected: undefined, layers: "both" as LayerMode, opacity: 0.75, ...NO_DRAFT };

// The editor works on its own copy of the FloorPlan; nothing reaches the project until it is saved
export const useEditorStore = create<EditorState>()((set, get) => ({
  ...INITIAL,
  load: (projectId, plan) => set({ ...INITIAL, projectId, plan }),
  commit: (change) => {
    const { plan, past } = get();
    if (!plan) return;
    const next = change(plan);
    if (next === plan) return;
    set({ plan: next, past: [...past, plan].slice(-HISTORY_LIMIT), future: [] });
  },
  // A drag records one history step when it starts and previews every move without recording
  checkpoint: () => {
    const { plan, past } = get();
    if (plan) set({ past: [...past, plan].slice(-HISTORY_LIMIT), future: [] });
  },
  dropCheckpoint: () => set((state) => ({ past: state.past.slice(0, -1) })),
  preview: (plan) => set({ plan }),
  undo: () => {
    const { plan, past, future } = get();
    const previous = past.at(-1);
    if (!plan || !previous) return;
    set({ plan: previous, past: past.slice(0, -1), future: [plan, ...future] });
  },
  redo: () => {
    const { plan, past, future } = get();
    const [next, ...rest] = future;
    if (!plan || !next) return;
    set({ plan: next, past: [...past, plan], future: rest });
  },
  select: (selected) => {
    const { plan, level } = get();
    set({ selected, level: (plan && selected && elementLevel(plan, selected)) || level });
  },
  // Like select, and also brings the element to the middle of the canvas
  focus: (ref) => {
    get().select(ref);
    const { plan, centerOn } = get();
    const anchor = plan && elementAnchor(plan, ref);
    if (anchor) centerOn?.(anchor);
  },
  setCenterOn: (centerOn) => set({ centerOn }),
  setTool: (tool) => set({ tool, ...NO_DRAFT }),
  setLayers: (layers) => set({ layers }),
  setOpacity: (opacity) => set({ opacity }),
  setLevel: (level) => set({ level, selected: undefined, ...NO_DRAFT }),
  setDraft: (draft) => set({ draft }),
  setCursor: (cursor) => set({ cursor }),
}));
