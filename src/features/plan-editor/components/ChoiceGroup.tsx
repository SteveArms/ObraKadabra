import { cn } from "@/lib/cn";

type Option<T extends string> = { value: T; label: string; description?: string };

type ChoiceGroupProps<T extends string> = { legend: string; name: string; value: T; options: Option<T>[]; onChange: (value: T) => void };

// Native radios inside full-row labels, so the whole card is the hit area and arrow keys move between options
export function ChoiceGroup<T extends string>({ legend, name, value, options, onChange }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="flex flex-col gap-space-xs">
      <legend className="mb-space-xs font-mono text-label-numeric-sm tracking-[0.05em] text-on-surface-variant uppercase">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={cn("flex cursor-pointer items-start gap-space-xs rounded-md p-space-xs transition-[background-color] duration-150", option.value === value ? "bg-primary-fixed/40" : "hover:bg-surface-container")}>
          <input type="radio" name={name} value={option.value} checked={option.value === value} onChange={() => onChange(option.value)} className="mt-1 accent-primary-container" />
          <span className="flex flex-col">
            <span className={cn("text-body-md", option.value === value ? "font-semibold text-primary" : "text-on-surface")}>{option.label}</span>
            {option.description ? <span className="text-body-sm text-on-surface-variant">{option.description}</span> : null}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
