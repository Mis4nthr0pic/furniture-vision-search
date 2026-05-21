import multer from "multer";
import { AppError } from "../utils/errors.js";

const MAX_BYTES = 10 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
});

export function multerErrorHandler(err: unknown): never {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      throw new AppError("FILE_TOO_LARGE", "Image must be 10MB or smaller", 413);
    }
    throw new AppError("UPLOAD_ERROR", err.message, 400);
  }
  throw err;
}
