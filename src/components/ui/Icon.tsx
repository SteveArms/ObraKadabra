import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type IconProps = {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
};

// A fixed square box: until the icon font loads the ligature shows as its name ("upload_file"), which must not push the layout
export function Icon({ name, filled = false, size = 20, className }: IconProps) {
  const side = `${size / 16}rem`;
  const style: CSSProperties = {
    fontSize: side,
    width: side,
    height: side,
    fontVariationSettings: `"FILL" ${filled ? 1 : 0}`,
  };
  return (
    <span aria-hidden="true" className={cn("material-symbols-outlined shrink-0 overflow-hidden", className)} style={style}>
      {name}
    </span>
  );
}
