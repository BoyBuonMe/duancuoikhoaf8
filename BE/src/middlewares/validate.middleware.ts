import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

type RequestPart = "body" | "query" | "params";

/**
 * Validate a single part of the Express request against a Zod schema.
 * On success, replaces req[part] with the parsed (typed, defaulted)
 * value so downstream handlers consume the sanitized payload.
 */
export function validate<T>(schema: ZodType<T>, part: RequestPart = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const issues = formatIssues(result.error);
      res.status(400).json({ message: "Invalid request", issues });
      return;
    }
    if (part === "query" || part === "params") {
      Object.assign(req[part], result.data);
    } else {
      (req as unknown as Record<RequestPart, unknown>)[part] = result.data;
    }
    next();
  };
}

function formatIssues(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
