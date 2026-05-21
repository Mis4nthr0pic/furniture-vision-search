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
      <span className="font-mono text-[10px] uppercase tracking-kicker text-terracotta/90">
        {label}
      </span>
      <select
        id={selectId}
        className={cn(
          "mt-2 w-full border-0 border-b border-terracotta/30 bg-transparent py-2 font-sans text-sm text-cream focus:border-terracotta focus:outline-none focus:ring-0",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink text-cream">
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-2 block font-serif text-sm italic text-cream/50">{hint}</span>}
    </label>
  );
}
