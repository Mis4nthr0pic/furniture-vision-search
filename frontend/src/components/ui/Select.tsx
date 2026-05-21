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
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <select
        id={selectId}
        className={cn(
          "mt-1.5 w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1.5 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}
