"use client";

import { useState, type KeyboardEvent, type MouseEvent } from "react";
import type { Point } from "@/schemas/floor-plan";

type Size = { width: number; height: number };

const STEP = 10;
const FINE_STEP = 1;

function clamp(point: Point, size: Size): Point {
  return { x: Math.min(Math.max(point.x, 0), size.width), y: Math.min(Math.max(point.y, 0), size.height) };
}

// Picks points in image pixels by click or tap, or with the keyboard: arrows move a crosshair, Enter places it
export function usePointPicker(size: Size, onPick: (point: Point) => void) {
  const [cursor, setCursor] = useState<Point | null>(null);

  const onClick = (event: MouseEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const x = ((event.clientX - box.left) / box.width) * size.width;
    const y = ((event.clientY - box.top) / box.height) * size.height;
    onPick(clamp({ x: Math.round(x), y: Math.round(y) }, size));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? FINE_STEP : STEP * Math.max(1, Math.round(size.width / 1000));
    const moves: Record<string, Point> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } };
    const current = cursor ?? { x: Math.round(size.width / 2), y: Math.round(size.height / 2) };
    if (event.key in moves) {
      event.preventDefault();
      setCursor(clamp({ x: current.x + moves[event.key].x, y: current.y + moves[event.key].y }, size));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPick(current);
    }
  };

  return { cursor, onClick, onKeyDown, onFocus: () => setCursor((value) => value ?? { x: Math.round(size.width / 2), y: Math.round(size.height / 2) }), onBlur: () => setCursor(null) };
}
