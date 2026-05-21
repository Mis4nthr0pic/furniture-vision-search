import multer from "multer";
import { describe, expect, it } from "vitest";
import { multerErrorHandler } from "../middleware/upload.js";
import { AppError } from "../utils/errors.js";

describe("multerErrorHandler", () => {
  it("maps LIMIT_FILE_SIZE to 413 FILE_TOO_LARGE", () => {
    const err = new multer.MulterError("LIMIT_FILE_SIZE");
    expect(() => multerErrorHandler(err)).toThrow(AppError);
    try {
      multerErrorHandler(err);
    } catch (error) {
      expect(error).toMatchObject({
        code: "FILE_TOO_LARGE",
        httpStatus: 413,
      });
    }
  });
});
