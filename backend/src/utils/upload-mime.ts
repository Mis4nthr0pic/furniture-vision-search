import { AppError } from "./errors.js";

export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function assertAllowedImageMime(mimeType: string | undefined): string {
  const normalized = (mimeType ?? "image/jpeg").toLowerCase().split(";")[0]!.trim();

  if (!ALLOWED_IMAGE_MIMES.has(normalized)) {
    throw new AppError(
      "INVALID_IMAGE_TYPE",
      `Unsupported image type "${normalized}". Allowed: JPEG, PNG, WebP`,
      400,
    );
  }

  return normalized === "image/jpg" ? "image/jpeg" : normalized;
}
