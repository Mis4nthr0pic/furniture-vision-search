import multer from "multer";
import { config } from "../config.js";
import { AppError } from "../utils/errors.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxBytes },
});

export function multerErrorHandler(err: unknown): never {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      throw new AppError(
        "FILE_TOO_LARGE",
        `Image must be ${config.upload.maxMegabytes}MB or smaller`,
        413,
      );
    }
    throw new AppError("UPLOAD_ERROR", err.message, 400);
  }
  throw err;
}
