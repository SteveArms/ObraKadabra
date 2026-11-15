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

type Set = (partial: Partial<EditorState> | ((state: EditorState) => Partial<EditorState>)) => void;
type HistoryActions = Pick<EditorState, "commit" | "checkpoint" | "dropCheckpoint" | "preview" | "undo" | "redo">;

// Undo keeps the last HISTORY_LIMIT plans; a drag records one step when it starts and previews every move without recording
function history(set: Set, get: () => EditorState): HistoryActions {
  const record = (plan: FloorPlan) => [...get().past, plan].slice(-HISTORY_LIMIT);
  return {
    commit: (change) => {
      const { plan } = get();
      const next = plan && change(plan);
      if (plan && next && next !== plan) set({ plan: next, past: record(plan), future: [] });
    },
    checkpoint: () => {
      const { plan } = get();
      if (plan) set({ past: record(plan), future: [] });
    },
    dropCheckpoint: () => set((state) => ({ past: state.past.slice(0, -1) })),
    preview: (plan) => set({ plan }),
    undo: () => {
      const { plan, past, future } = get();
      const previous = past.at(-1);
      if (plan && previous) set({ plan: previous, past: past.slice(0, -1), future: [plan, ...future] });
    },
    redo: () => {
      const { plan, past, future } = get();
      const [next, ...rest] = future;
      if (plan && next) set({ plan: next, past: [...past, plan], future: rest });
    },
  };
}

// The editor works on its own copy of the FloorPlan; nothing reaches the project until it is saved
export const useEditorStore = create<EditorState>()((set, get) => ({
  ...INITIAL,
  load: (projectId, plan) => set({ ...INITIAL, projectId, plan }),
  ...history(set, get),
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
