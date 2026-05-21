import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface SectionHeaderProps {
  kicker: string;
  kickerNum?: string;
  title: ReactNode;
  subtitle?: string;
  aside?: string;
  asideTilt?: number;
  className?: string;
}

export function SectionHeader({
  kicker,
  kickerNum,
  title,
  subtitle,
  aside,
  asideTilt = -4,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("relative max-w-3xl", className)}>
      <p className="font-mono text-[10px] uppercase tracking-kicker text-terracotta">
        ✦ {kickerNum ? `No. ${kickerNum}` : null}
        {kickerNum ? " · " : null}
        {kicker}
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.5rem,8vw,5.5rem)] italic leading-[0.95] tracking-[-0.04em] text-cream">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 max-w-[520px] font-serif text-lg italic leading-relaxed text-cream/75 sm:text-xl">
          {subtitle}
        </p>
      )}
      {aside && (
        <p
          className="pointer-events-none absolute -right-2 top-0 hidden font-hand text-xl text-ochre sm:block lg:-right-8"
          style={{ transform: `rotate(${asideTilt}deg)` }}
        >
          {aside}
        </p>
      )}
    </header>
  );
}
