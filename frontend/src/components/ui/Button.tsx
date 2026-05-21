import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/format";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-terracotta text-cream shadow-cta hover:bg-paprika focus-visible:ring-terracotta/50 disabled:bg-terracotta/50",
  secondary:
    "border border-cream/25 bg-transparent text-cream hover:border-terracotta hover:text-terracotta focus-visible:ring-cream/30",
  ghost: "bg-transparent text-cream/70 hover:text-cream hover:bg-cream/5",
  success: "bg-teal text-cream hover:bg-teal/90 shadow-polaroid",
  danger: "bg-plum text-cream hover:bg-plum/90",
};

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-55",
        isPrimary && "font-display text-base italic tracking-tight",
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin-slow rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
      {isPrimary && !loading && (
        <span className="font-hand text-lg text-ochre" aria-hidden>
          →
        </span>
      )}
    </button>
  );
}
