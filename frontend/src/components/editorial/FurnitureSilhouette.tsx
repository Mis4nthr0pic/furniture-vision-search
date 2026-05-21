import type { ReactNode } from "react";
import { cn } from "../../utils/format";

/** Stylized line-art placeholder used until product photography exists. */
export function FurnitureSilhouette({
  category,
  className,
}: {
  category?: string | null;
  className?: string;
}) {
  const key = (category ?? "").toLowerCase();
  const paths: Record<string, ReactNode> = {
    default: (
      <>
        <rect x="32" y="48" width="136" height="6" rx="1" />
        <path d="M42 54 V92 M158 54 V92" strokeLinecap="round" />
        <path d="M38 92 H162" strokeLinecap="round" />
      </>
    ),
    chairs: (
      <>
        <path d="M74 38 C74 26 126 26 126 38 V70 H74 Z" fill="none" />
        <path d="M70 70 H130 V90 H70 Z" fill="none" />
        <path d="M78 90 V108 M122 90 V108" strokeLinecap="round" />
        <path d="M66 108 H84 M116 108 H134" strokeLinecap="round" opacity="0.4" />
      </>
    ),
    sofas: (
      <>
        <path d="M28 62 H172 V92 H28 Z" fill="none" />
        <path d="M36 62 V46 H164 V62" fill="none" />
        <path d="M44 92 V106 M156 92 V106" strokeLinecap="round" />
        <path d="M28 76 H172" opacity="0.3" />
        <path d="M76 62 V92 M124 62 V92" opacity="0.25" />
      </>
    ),
    tables: (
      <>
        <rect x="24" y="58" width="152" height="6" rx="1" />
        <path d="M40 64 V104 M160 64 V104" strokeLinecap="round" />
        <path d="M40 104 H46 M154 104 H160" strokeLinecap="round" opacity="0.4" />
        <path d="M24 58 H176" opacity="0.3" />
      </>
    ),
    beds: (
      <>
        <path d="M22 76 H178 V104 H22 Z" fill="none" />
        <path d="M22 76 V52 H64 V76" fill="none" />
        <path d="M30 104 V112 M170 104 V112" strokeLinecap="round" />
        <path d="M64 88 H178" opacity="0.3" />
        <path d="M70 70 H120 V58" opacity="0.4" fill="none" />
      </>
    ),
    storage: (
      <>
        <path d="M44 30 H156 V108 H44 Z" fill="none" />
        <path d="M44 60 H156 M44 90 H156" opacity="0.5" />
        <circle cx="98" cy="46" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="102" cy="46" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="98" cy="76" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="102" cy="76" r="1.5" fill="currentColor" stroke="none" />
      </>
    ),
    lighting: (
      <>
        <path d="M70 24 H130 L116 56 H84 Z" fill="none" />
        <path d="M100 56 V104" strokeLinecap="round" />
        <path d="M76 104 H124" strokeLinecap="round" />
        <path d="M60 64 L78 56 M140 64 L122 56" opacity="0.3" />
      </>
    ),
    rugs: (
      <>
        <path d="M28 48 H172 V96 H28 Z" fill="none" />
        <path d="M40 60 H160 M40 84 H160" opacity="0.4" />
        <path d="M28 72 H172" opacity="0.25" />
        <path d="M68 48 V96 M132 48 V96" opacity="0.25" />
      </>
    ),
    decor: (
      <>
        <path d="M88 30 H112 L120 96 H80 Z" fill="none" />
        <path d="M80 96 H120 V104 H80 Z" fill="none" />
        <path d="M92 30 V20 H108 V30" opacity="0.5" />
      </>
    ),
  };

  const shape = paths[key] ?? paths.default;

  return (
    <svg
      viewBox="0 0 200 130"
      className={cn("h-full w-full text-accent/70", className)}
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      aria-hidden
    >
      {shape}
    </svg>
  );
}
