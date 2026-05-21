import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/format";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-bg hover:bg-accent-deep focus-visible:ring-accent/40 disabled:bg-accent/50",
  secondary:
    "border border-hair bg-transparent text-ink hover:border-hairStrong hover:bg-panel focus-visible:ring-hairStrong/50",
  ghost: "bg-transparent text-ink-soft hover:bg-panel hover:text-ink",
  success: "border border-signal/30 bg-signal/10 text-signal hover:bg-signal/15",
  danger: "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/15",
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
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      style={{ borderRadius: variant === "primary" || variant === "secondary" ? 4 : undefined }}
      {...props}
    >
      {loading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
