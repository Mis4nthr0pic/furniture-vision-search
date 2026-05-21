import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/format";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextArea({ label, hint, className, id, ...props }: TextAreaProps) {
  const areaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={areaId} className="block">
      <span className="font-mono text-[10px] uppercase tracking-kicker text-terracotta/90">
        {label}
      </span>
      <textarea
        id={areaId}
        className={cn(
          "mt-2 w-full resize-y border-0 border-b border-terracotta/30 bg-transparent py-2 font-serif text-base italic text-cream placeholder:text-cream/35 focus:border-terracotta focus:outline-none focus:ring-0",
          className,
        )}
        {...props}
      />
      {hint && <span className="mt-2 block font-serif text-sm italic text-cream/50">{hint}</span>}
    </label>
  );
}
