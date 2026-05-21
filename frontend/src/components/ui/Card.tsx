import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
};

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div className={cn("instrument-panel", paddingMap[padding], className)}>{children}</div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  sectionId,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  sectionId?: string;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3 border-b border-hair pb-3">
      <div>
        {sectionId && <p className="instrument-kicker">{sectionId}</p>}
        <h2 className="text-[15px] font-medium tracking-[-0.02em] text-ink">{title}</h2>
        {description && (
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
