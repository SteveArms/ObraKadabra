import { connection } from "next/server";

// Server only: marks the render as per request before reading the clock, so "today" is never frozen into a prerendered page
export async function requestTime(): Promise<number> {
  await connection();
  return Date.now();
}
