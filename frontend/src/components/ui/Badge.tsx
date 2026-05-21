import { cn } from "../../utils/format";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning";
}

const tones = {
  neutral: "border-cream/20 text-cream/80",
  brand: "border-terracotta/50 text-terracotta",
  success: "border-teal/50 text-teal",
  warning: "border-ochre/50 text-ochre",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-2.5 py-0.5 font-serif text-xs italic",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
