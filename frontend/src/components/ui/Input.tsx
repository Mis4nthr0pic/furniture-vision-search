import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/format";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function Input({ label, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="block">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <input
        id={inputId}
        className={cn(
          "mt-1.5 w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm transition placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
          className,
        )}
        {...props}
      />
      {hint && <span className="mt-1.5 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}
