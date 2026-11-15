import { create } from "zustand";
import type { ElementStatus, Stage } from "@/schemas/schedule";
import type { ColorMode, ElementEntry } from "./scene";

export type ViewMode = "top" | "iso" | "front";
export type NavMode = "orbit" | "pan" | "zoom";
export type HoverPoint = { x: number; y: number; z: number };
export type ModelSource = "glb" | "plan";
export type GlbIssue = "load_failed" | "unlabeled" | "misaligned";
export type ElementSpan = { stage: Stage; level: number; startWeek: number; endWeek: number };
export type ViewerTimeline = { week: number; spans: Record<string, ElementSpan>; plastered: Record<string, boolean> };

type ViewerState = {
  view: ViewMode;
  navMode: NavMode;
  colorMode: ColorMode;
  levelCut: number;
  selectedKey?: string;
  hover?: HoverPoint;
  entries: ElementEntry[];
  statuses: Record<string, ElementStatus>;
  source?: ModelSource;
  glbIssue?: GlbIssue;
  timeline?: ViewerTimeline;
  reset: (topLevel: number) => void;
  setView: (view: ViewMode) => void;
  setNavMode: (navMode: NavMode) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setLevelCut: (levelCut: number) => void;
  select: (key?: string) => void;
  setHover: (hover?: HoverPoint) => void;
  setEntries: (entries: ElementEntry[], source?: ModelSource) => void;
  rejectGlb: (issue: GlbIssue) => void;
  setTimeline: (timeline: ViewerTimeline | undefined, statuses: Record<string, ElementStatus>) => void;
};

export const useViewerStore = create<ViewerState>((set) => ({
  view: "iso",
  navMode: "orbit",
  colorMode: "material",
  levelCut: 1,
  entries: [],
  statuses: {},
  reset: (topLevel) =>
    set({ view: "iso", navMode: "orbit", levelCut: topLevel, selectedKey: undefined, hover: undefined, entries: [], statuses: {}, source: undefined, glbIssue: undefined, timeline: undefined }),
  setView: (view) => set({ view }),
  setNavMode: (navMode) => set({ navMode }),
  setColorMode: (colorMode) => set({ colorMode }),
  setLevelCut: (levelCut) => set({ levelCut }),
  select: (selectedKey) => set({ selectedKey }),
  setHover: (hover) => set({ hover }),
  setEntries: (entries, source) => set({ entries, source }),
  rejectGlb: (glbIssue) => set({ glbIssue, entries: [], source: undefined }),
  setTimeline: (timeline, statuses) => set({ timeline, statuses }),
}));

export function statusOf(statuses: Record<string, ElementStatus>, key: string): ElementStatus {
  return statuses[key] ?? "not_started";
}

type VisibilityState = Pick<ViewerState, "levelCut" | "statuses" | "timeline">;

// With a schedule driving the viewer, elements that have not started yet stay hidden
export function isEntryVisible(entry: ElementEntry, { levelCut, statuses, timeline }: VisibilityState): boolean {
  if (entry.level > levelCut) return false;
  return !timeline || statusOf(statuses, entry.key) !== "not_started";
}

export function visibleEntries(entries: ElementEntry[], state: VisibilityState): ElementEntry[] {
  return entries.filter((entry) => isEntryVisible(entry, state));
}
