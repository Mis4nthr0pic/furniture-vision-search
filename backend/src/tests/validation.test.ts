import { describe, expect, it } from "vitest";
import { AppError } from "../utils/errors.js";
import {
  ALLOWED_IMAGE_MIMES,
  assertAllowedImageMime,
  detectImageMime,
  validateImageUpload,
} from "../utils/upload-mime.js";
import { parseJsonField } from "../utils/validation.js";

describe("parseJsonField", () => {
  it("parses valid JSON strings", () => {
    expect(parseJsonField('{"a":1}')).toEqual({ a: 1 });
  });

  it("passes through non-string values", () => {
    expect(parseJsonField({ b: 2 })).toEqual({ b: 2 });
  });

  it("throws friendly 400 on invalid JSON", () => {
    expect(() => parseJsonField("{not json")).toThrow(AppError);
    try {
      parseJsonField("{not json");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.code).toBe("INVALID_JSON");
      expect(appErr.httpStatus).toBe(400);
    }
  });
});

describe("assertAllowedImageMime", () => {
  it("accepts common image types", () => {
    for (const mime of ALLOWED_IMAGE_MIMES) {
      expect(assertAllowedImageMime(mime)).toBeTruthy();
    }
    expect(assertAllowedImageMime("image/jpeg")).toBe("image/jpeg");
    expect(assertAllowedImageMime("image/jpg")).toBe("image/jpeg");
  });

  it("rejects non-image MIME types", () => {
    expect(() => assertAllowedImageMime("application/pdf")).toThrow(AppError);
    expect(() => assertAllowedImageMime("text/html")).toThrow(/Unsupported image type/);
  });

  it("defaults missing MIME to jpeg then validates", () => {
    expect(assertAllowedImageMime(undefined)).toBe("image/jpeg");
  });
});

describe("validateImageUpload", () => {
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);

  it("detects PNG magic bytes", () => {
    expect(detectImageMime(pngHeader)).toBe("image/png");
  });

  it("accepts matching PNG upload", () => {
    expect(validateImageUpload(pngHeader, "image/png")).toBe("image/png");
  });

  it("rejects spoofed content type", () => {
    expect(() => validateImageUpload(pngHeader, "image/jpeg")).toThrow(AppError);
  });

  it("rejects non-image bytes", () => {
    expect(() => validateImageUpload(Buffer.from("hello"), "image/png")).toThrow(AppError);
  });
});
