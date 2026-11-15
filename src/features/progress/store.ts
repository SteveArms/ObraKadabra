import { create } from "zustand";
import type { ProgressFinding, ReportedStatus } from "@/schemas/progress";
import type { AnalysisState, SitePhoto } from "./types";

type ProgressState = {
  choiceId: string;
  roomId?: string;
  photo?: SitePhoto;
  analysis: AnalysisState;
  findings: ProgressFinding[];
  entryId?: string;
  editing: boolean;
  setChoice: (choiceId: string) => void;
  setRoom: (roomId?: string) => void;
  setPhoto: (photo?: SitePhoto) => void;
  setAnalysis: (analysis: AnalysisState) => void;
  setResult: (entryId: string, findings: ProgressFinding[]) => void;
  setEditing: (editing: boolean) => void;
  setStatus: (elementId: string, status: ReportedStatus) => void;
  reset: () => void;
};

const INITIAL = { choiceId: "floor-1", roomId: undefined, photo: undefined, analysis: { status: "idle" } as AnalysisState, findings: [], entryId: undefined, editing: false };

// A corrected status keeps the photo's percent only while the element stays in progress
const PERCENT_FOR: Record<ReportedStatus, (percent: number) => number> = { done: () => 100, not_started: () => 0, in_progress: (percent) => (percent > 0 && percent < 100 ? percent : 50) };

export const useProgressStore = create<ProgressState>()((set) => ({
  ...INITIAL,
  setChoice: (choiceId) => set({ choiceId, roomId: undefined }),
  setRoom: (roomId) => set({ roomId }),
  setPhoto: (photo) =>
    set((state) => {
      if (state.photo) URL.revokeObjectURL(state.photo.url);
      return { photo, analysis: { status: "idle" }, findings: [], entryId: undefined, editing: false };
    }),
  setAnalysis: (analysis) => set({ analysis }),
  setResult: (entryId, findings) => set({ entryId, findings, analysis: { status: "done" } }),
  setEditing: (editing) => set({ editing }),
  setStatus: (elementId, status) =>
    set((state) => ({
      findings: state.findings.map((finding) => (finding.elementId === elementId ? { ...finding, status, percent: PERCENT_FOR[status](finding.percent) } : finding)),
    })),
  reset: () =>
    set((state) => {
      if (state.photo) URL.revokeObjectURL(state.photo.url);
      return INITIAL;
    }),
}));
