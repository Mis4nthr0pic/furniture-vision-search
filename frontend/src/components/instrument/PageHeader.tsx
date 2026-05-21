import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface PageHeaderProps {
  sectionId: string;
  kicker: string;
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
}

export function PageHeader({ sectionId, kicker, title, meta, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 border-b border-hair pb-6", className)}>
      <p className="instrument-kicker">
        {sectionId} · {kicker}
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="max-w-3xl text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
          {title}
        </h1>
        {meta && (
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-muted">
            {meta}
          </div>
        )}
      </div>
    </header>
  );
}
