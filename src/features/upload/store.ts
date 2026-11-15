import { create } from "zustand";
import type { Point } from "@/schemas/floor-plan";
import type { Edits, Raster, Sheet, WizardDetails, WizardStep } from "./types";

export const NO_EDITS: Edits = { rotation: 0, contrast: false, crop: null };
export const DEFAULT_DETAILS: WizardDetails = { name: "", levels: 1, floorHeight: "2.60", roofType: "concrete_slab" };

type UploadState = {
  step: WizardStep;
  sheets: Sheet[];
  activeId: string | null;
  details: WizardDetails;
  setStep: (step: WizardStep) => void;
  addSheet: (sheet: Sheet) => void;
  replaceSheet: (id: string, sheet: Sheet) => void;
  removeSheet: (id: string) => void;
  setActive: (id: string) => void;
  setImage: (id: string, edits: Edits, image: Raster) => void;
  setPoints: (id: string, points: Point[]) => void;
  setMeters: (id: string, meters: string) => void;
  setDetails: (details: Partial<WizardDetails>) => void;
  reset: () => void;
};

function release(...rasters: Raster[]): void {
  for (const raster of new Set(rasters)) URL.revokeObjectURL(raster.url);
}

function update(sheets: Sheet[], id: string, change: (sheet: Sheet) => Sheet): Sheet[] {
  return sheets.map((sheet) => (sheet.id === id ? change(sheet) : sheet));
}

export const useUploadStore = create<UploadState>()((set, get) => ({
  step: 0,
  sheets: [],
  activeId: null,
  details: DEFAULT_DETAILS,
  setStep: (step) => set({ step }),
  addSheet: (sheet) => set((state) => ({ sheets: [...state.sheets, sheet], activeId: sheet.id })),
  replaceSheet: (id, next) => {
    const old = get().sheets.find((sheet) => sheet.id === id);
    if (old) release(old.source, old.image);
    set((state) => ({ sheets: update(state.sheets, id, () => next), activeId: next.id }));
  },
  removeSheet: (id) => {
    const old = get().sheets.find((sheet) => sheet.id === id);
    if (old) release(old.source, old.image);
    set((state) => {
      const sheets = state.sheets.filter((sheet) => sheet.id !== id);
      return { sheets, activeId: sheets.at(-1)?.id ?? null };
    });
  },
  setActive: (activeId) => set({ activeId }),
  // A new image means new pixels, so any calibration on the old one no longer applies
  setImage: (id, edits, image) => {
    const old = get().sheets.find((sheet) => sheet.id === id);
    if (old && old.image !== old.source) release(old.image);
    set((state) => ({ sheets: update(state.sheets, id, (sheet) => ({ ...sheet, edits, image, calibration: { ...sheet.calibration, points: [] } })) }));
  },
  setPoints: (id, points) => set((state) => ({ sheets: update(state.sheets, id, (sheet) => ({ ...sheet, calibration: { ...sheet.calibration, points } })) })),
  setMeters: (id, meters) => set((state) => ({ sheets: update(state.sheets, id, (sheet) => ({ ...sheet, calibration: { ...sheet.calibration, meters } })) })),
  setDetails: (details) => set((state) => ({ details: { ...state.details, ...details } })),
  reset: () => {
    for (const sheet of get().sheets) release(sheet.source, sheet.image);
    set({ step: 0, sheets: [], activeId: null, details: DEFAULT_DETAILS });
  },
}));
