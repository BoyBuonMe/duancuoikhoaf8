import type { NextFunction, Request, Response } from "express";

interface MongoDuplicateError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

interface AppError extends Error {
  status?: number;
  statusCode?: number;
  code?: string | number;
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: "Not found", path: req.originalUrl });
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const mongoErr = err as MongoDuplicateError;
  if (mongoErr.code === 11000) {
    const fields = mongoErr.keyPattern
      ? Object.keys(mongoErr.keyPattern)
      : [];
    const message = fields.includes("email")
      ? "Email already registered"
      : "Duplicate value";

    res.status(409).json({
      message,
      ...(fields.length > 0 && { fields }),
    });
    return;
  }

  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || "Internal server error";

  if (status >= 500) {
    if (process.env.NODE_ENV !== "production" && err.stack) {
      console.error(err.stack);
    } else {
      console.error(err);
    }
  }

  res.status(status).json({
    message,
    ...(typeof err.code === "string" && { code: err.code }),
  });
}
