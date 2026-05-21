import type { ReactNode } from "react";
import { cn } from "../../utils/format";

export function ArchedFrame({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-arch border border-cream/10 bg-burgundy/60",
        className,
      )}
    >
      <div className={cn("flex items-center justify-center", innerClassName)}>{children}</div>
    </div>
  );
}
