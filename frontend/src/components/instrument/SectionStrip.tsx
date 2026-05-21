import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface SectionStripProps {
  sectionId: string;
  label: string;
  controls?: ReactNode;
  className?: string;
}

export function SectionStrip({ sectionId, label, controls, className }: SectionStripProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-hair py-2.5",
        className,
      )}
    >
      <div className="flex items-baseline gap-2">
        <span className="instrument-kicker">{sectionId}</span>
        <span className="text-[15px] font-medium tracking-[-0.02em] text-ink">{label}</span>
      </div>
      {controls && <div className="flex items-center divide-x divide-hair">{controls}</div>}
    </div>
  );
}
