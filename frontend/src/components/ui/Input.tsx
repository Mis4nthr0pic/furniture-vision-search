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
      <span className="font-mono text-[10px] uppercase tracking-kicker text-terracotta/90">
        {label}
      </span>
      <input
        id={inputId}
        className={cn("salon-underline-input mt-2", className)}
        {...props}
      />
      {hint && <span className="mt-2 block font-serif text-sm italic text-cream/50">{hint}</span>}
    </label>
  );
}
