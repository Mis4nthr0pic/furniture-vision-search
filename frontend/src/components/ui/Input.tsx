import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/format";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  variant?: "box" | "underline";
}

export function Input({ label, hint, className, id, variant = "box", ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="block">
      <span className="instrument-kicker">{label}</span>
      <input
        id={inputId}
        className={cn(
          "mt-1.5",
          variant === "underline" ? "instrument-input-underline" : "instrument-input",
          className,
        )}
        {...props}
      />
      {hint && <span className="mt-1.5 block font-mono text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}
