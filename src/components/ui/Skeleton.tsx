import { cn } from "@/lib/cn";

// A grey placeholder in the shape of what is loading; it stays still when the user prefers reduced motion
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("rounded-md bg-surface-container-high motion-safe:animate-pulse", className)} />;
}
