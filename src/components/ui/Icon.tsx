import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type IconProps = {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
};

export function Icon({ name, filled = false, size = 20, className }: IconProps) {
  const style: CSSProperties = {
    fontSize: `${size / 16}rem`,
    fontVariationSettings: `"FILL" ${filled ? 1 : 0}`,
  };
  return (
    <span aria-hidden="true" className={cn("material-symbols-outlined shrink-0", className)} style={style}>
      {name}
    </span>
  );
}
