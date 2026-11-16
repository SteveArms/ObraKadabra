export const TOUR_STORAGE_KEY = "obrakadabra:tour-done";

export type TourStep = { icon: string; title: string; text: string };

export const TOUR_STEPS: TourStep[] = [
  { icon: "timeline", title: "Travel through the weeks", text: "Move the timeline slider to watch the house go up week by week and see which materials each week needs." },
  { icon: "3d_rotation", title: "Explore the model", text: "Drag to turn the house around. Tap a wall or column to see its stage, cost and materials." },
  { icon: "photo_camera", title: "Log real progress", text: "Take a site photo: the AI compares it with the plan and paints what was really built." },
];
