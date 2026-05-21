import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/format";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-800 text-white shadow-sm hover:bg-brand-900 focus-visible:ring-brand-600 disabled:bg-brand-800/60",
  secondary:
    "bg-white text-stone-800 ring-1 ring-surface-border hover:bg-brand-50 focus-visible:ring-brand-500",
  ghost: "bg-transparent text-stone-600 hover:bg-brand-100/80 hover:text-stone-900",
  success: "bg-emerald-700 text-white hover:bg-emerald-800",
  danger: "bg-rose-700 text-white hover:bg-rose-800",
};

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
