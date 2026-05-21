import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface AlertProps {
  tone?: "error" | "warning" | "info";
  title?: string;
  children: ReactNode;
}

const styles = {
  error: "border-danger/40 bg-danger/5 text-ink",
  warning: "border-warn/40 bg-warn/5 text-ink",
  info: "border-hair bg-panel text-ink-soft",
};

export function Alert({ tone = "info", title, children }: AlertProps) {
  return (
    <div className={cn("border px-3 py-2.5 text-ui", styles[tone])} role="alert">
      {title && <p className="font-medium text-ink">{title}</p>}
      <div className={cn(title && "mt-1", "font-mono text-[12px] leading-relaxed text-ink-soft")}>
        {children}
      </div>
    </div>
  );
}
