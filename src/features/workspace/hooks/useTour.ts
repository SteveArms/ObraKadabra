"use client";

import { useState, useSyncExternalStore } from "react";
import { TOUR_STEPS, TOUR_STORAGE_KEY } from "../tour";

const listeners = new Set<() => void>();

function readDone(): boolean {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  } catch {
    return true;
  }
}

function markDone() {
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
  } catch {
    // Blocked storage only means the tour may show again next time
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Shown once per browser; the server render assumes it was seen so it never flashes before hydration
export function useTour() {
  const done = useSyncExternalStore(subscribe, readDone, () => true);
  const [index, setIndex] = useState(0);
  const last = index === TOUR_STEPS.length - 1;
  return {
    open: !done,
    index,
    step: TOUR_STEPS[index],
    last,
    next: () => (last ? markDone() : setIndex(index + 1)),
    skip: markDone,
  };
}
