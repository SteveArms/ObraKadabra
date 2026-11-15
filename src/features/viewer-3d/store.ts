import { create } from "zustand";
import type { ElementStatus } from "@/schemas/schedule";
import type { ElementEntry } from "./scene";

export type ViewMode = "top" | "iso" | "front";
export type NavMode = "orbit" | "pan" | "zoom";
export type HoverPoint = { x: number; y: number; z: number };
export type ModelSource = "glb" | "plan";
export type GlbIssue = "load_failed" | "unlabeled" | "misaligned";

type ViewerState = {
  view: ViewMode;
  navMode: NavMode;
  levelCut: number;
  selectedKey?: string;
  hover?: HoverPoint;
  entries: ElementEntry[];
  statuses: Record<string, ElementStatus>;
  source?: ModelSource;
  glbIssue?: GlbIssue;
  reset: (topLevel: number) => void;
  setView: (view: ViewMode) => void;
  setNavMode: (navMode: NavMode) => void;
  setLevelCut: (levelCut: number) => void;
  select: (key?: string) => void;
  setHover: (hover?: HoverPoint) => void;
  setEntries: (entries: ElementEntry[], source?: ModelSource) => void;
  rejectGlb: (issue: GlbIssue) => void;
};

export const useViewerStore = create<ViewerState>((set) => ({
  view: "iso",
  navMode: "orbit",
  levelCut: 1,
  entries: [],
  statuses: {},
  reset: (topLevel) =>
    set({ view: "iso", navMode: "orbit", levelCut: topLevel, selectedKey: undefined, hover: undefined, entries: [], statuses: {}, source: undefined, glbIssue: undefined }),
  setView: (view) => set({ view }),
  setNavMode: (navMode) => set({ navMode }),
  setLevelCut: (levelCut) => set({ levelCut }),
  select: (selectedKey) => set({ selectedKey }),
  setHover: (hover) => set({ hover }),
  setEntries: (entries, source) => set({ entries, source }),
  rejectGlb: (glbIssue) => set({ glbIssue, entries: [], source: undefined }),
}));

// TODO: compute each element status from the schedule and progress in phase 3
export function statusOf(statuses: Record<string, ElementStatus>, key: string): ElementStatus {
  return statuses[key] ?? "not_started";
}

export function visibleEntries(entries: ElementEntry[], levelCut: number): ElementEntry[] {
  return entries.filter((entry) => entry.level <= levelCut);
}
