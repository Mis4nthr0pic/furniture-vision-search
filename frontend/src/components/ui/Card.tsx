import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  tone?: "dark" | "polaroid";
}

const paddingMap = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className, padding = "md", tone = "dark" }: CardProps) {
  return (
    <div
      className={cn(
        paddingMap[padding],
        tone === "dark" && "rounded-lg border border-cream/8 bg-ink-rise/90 backdrop-blur-sm",
        tone === "polaroid" && "rounded-sm bg-butter text-ink shadow-polaroid",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  kicker,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  kicker?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        {kicker && (
          <p className="font-mono text-[10px] uppercase tracking-kicker text-terracotta">{kicker}</p>
        )}
        <h2 className="font-display text-2xl italic tracking-tight text-cream">{title}</h2>
        {description && (
          <p className="mt-1 font-serif text-sm italic text-cream/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
