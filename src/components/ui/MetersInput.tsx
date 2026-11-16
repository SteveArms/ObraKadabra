import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type MetersInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { size?: "md" | "sm"; invalid?: boolean; wrapperClassName?: string };

// One decimal field with its "m" unit for every length the user types: calibration, floor height, wall and opening sizes
export function MetersInput({ size = "md", invalid = false, wrapperClassName, ...props }: MetersInputProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-md border bg-surface-container-lowest focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-container",
        invalid ? "border-error" : "border-outline-variant",
        wrapperClassName,
      )}
    >
      <input
        inputMode="decimal"
        autoComplete="off"
        aria-invalid={invalid || undefined}
        {...props}
        className={cn("w-full min-w-0 bg-transparent font-mono tabular-nums outline-none", size === "md" ? "min-h-11 px-space-sm text-body-lg" : "min-h-9 px-space-xs text-label-numeric-md max-sm:min-h-11")}
      />
      <span aria-hidden="true" className={cn("pe-space-sm font-mono text-on-surface-variant", size === "md" ? "text-body-md" : "text-label-numeric-sm")}>
        m
      </span>
    </div>
  );
}
