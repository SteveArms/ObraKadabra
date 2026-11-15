// Drawing grid of the editor, in meters
export const GRID_METERS = 0.05;

// Snapping reach in screen pixels, so it feels the same at any zoom
export const SNAP_PX = 10;

// Walls drawn within this many degrees of horizontal or vertical are straightened
export const ANGLE_SNAP_DEG = 5;

export const HISTORY_LIMIT = 100;

export const ZOOM_LIMITS = { min: 0.5, max: 12, step: 1.25 } as const;

// Room kept around the plan when it is fitted, so the tool rail and the toolbar never cover it
export const FRAME_INSETS = { top: 64, right: 16, bottom: 48, left: 72 } as const;
