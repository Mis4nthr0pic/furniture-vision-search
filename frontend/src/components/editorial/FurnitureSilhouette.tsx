import type { ReactNode } from "react";
import { cn } from "../../utils/format";

/** Stylized line-art placeholder until product photography exists. */
export function FurnitureSilhouette({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const stroke = "currentColor";
  const paths: Record<string, ReactNode> = {
    default: (
      <>
        <rect x="28" y="48" width="144" height="8" rx="2" fill={stroke} opacity="0.35" />
        <path d="M40 56 V88 M168 56 V88" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M36 88 H172" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
    Chairs: (
      <>
        <path d="M72 40 C72 28 128 28 128 40 V72 H72 Z" stroke={stroke} strokeWidth="2.5" fill="none" />
        <path d="M68 72 H132 V92 H68 Z" stroke={stroke} strokeWidth="2" fill="none" />
        <path d="M76 92 V108 M124 92 V108" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
    Sofas: (
      <>
        <path d="M32 64 H168 V92 H32 Z" stroke={stroke} strokeWidth="2.5" fill="none" />
        <path d="M40 64 V48 H160 V64" stroke={stroke} strokeWidth="2" fill="none" />
        <path d="M48 92 V108 M152 92 V108" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 200 120"
      className={cn("h-full w-full text-cream/25", className)}
      aria-hidden
    >
      {paths[category] ?? paths.default}
    </svg>
  );
}
