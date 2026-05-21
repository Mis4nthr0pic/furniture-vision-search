import { cn } from "../../utils/format";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning";
}

const tones = {
  neutral: "bg-stone-100 text-stone-700",
  brand: "bg-brand-100 text-brand-800",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-900",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
