import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/format";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  options: SelectOption[];
}

export function Select({ label, hint, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={selectId} className="block">
      <span className="instrument-kicker">{label}</span>
      <select id={selectId} className={cn("instrument-input mt-1.5", className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1.5 block font-mono text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}
