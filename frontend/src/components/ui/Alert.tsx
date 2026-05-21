import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface AlertProps {
  tone?: "error" | "warning" | "info";
  title?: string;
  children: ReactNode;
}

const styles = {
  error: "border-plum/60 bg-plum/20 text-cream",
  warning: "border-ochre/50 bg-ochre/10 text-cream",
  info: "border-teal/50 bg-teal/15 text-cream",
};

export function Alert({ tone = "info", title, children }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 font-sans text-sm backdrop-blur-sm",
        styles[tone],
      )}
      role="alert"
    >
      {title && <p className="font-display text-base italic">{title}</p>}
      <div className={cn(title && "mt-1", "font-serif italic leading-relaxed opacity-90")}>
        {children}
      </div>
    </div>
  );
}
