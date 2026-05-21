import { AppError } from "./errors.js";

export const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

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

export function validateImageUpload(buffer: Buffer, claimedMime: string | undefined): string {
  const detected = detectImageMime(buffer);
  if (!detected) {
    throw new AppError("INVALID_IMAGE_TYPE", "File is not a valid JPEG, PNG, or WebP image", 400);
  }

  const normalizedClaim = assertAllowedImageMime(claimedMime ?? detected);

  if (detected !== normalizedClaim) {
    throw new AppError(
      "INVALID_IMAGE_TYPE",
      `Content-Type "${normalizedClaim}" does not match file contents (${detected})`,
      400,
    );
  }

  return detected;
}
