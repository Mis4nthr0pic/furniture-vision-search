import type { ReactNode } from "react";
import { cn } from "../../utils/format";

interface AlertProps {
  tone?: "error" | "warning" | "info";
  title?: string;
  children: ReactNode;
}

const styles = {
  error: "border-rose-200 bg-rose-50 text-rose-900",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
};

export function Alert({ tone = "info", title, children }: AlertProps) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", styles[tone])} role="alert">
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
