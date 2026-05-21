/** Fixed polaroid rotations per sibling index — never random. */
export const POLAROID_ROTATIONS = [-2.2, 1.4, -0.8, 2.8, -1.6, 0.5, -2.5, 1.1] as const;

export const POLAROID_SHADOW = "8px 10px 0 0 rgba(0,0,0,0.3)";

export const CTA_SHADOW = "5px 6px 0 0 #D89B3D";

export function polaroidRotation(index: number): number {
  return POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length] ?? 0;
}
