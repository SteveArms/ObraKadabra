import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { pressed: boolean };

export function ToggleButton({ pressed, className, type = "button", ...props }: ToggleButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(
        "inline-flex min-h-8 items-center justify-center gap-1 rounded-md px-2 text-body-sm whitespace-nowrap transition-[background-color,color] duration-150",
        pressed ? "bg-primary-container font-semibold text-on-primary" : "text-on-surface hover:bg-surface-container-high",
        className,
      )}
      {...props}
    />
  );
}
