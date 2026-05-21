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
      <span className="instrument-kicker">{label}</span>
      <textarea
        id={areaId}
        className={cn("instrument-input mt-1.5 min-h-[88px] resize-y font-mono text-[12px]", className)}
        {...props}
      />
      {hint && <span className="mt-1.5 block font-mono text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}
