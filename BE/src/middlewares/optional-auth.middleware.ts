import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "@/utils/jwt";

/**
 * Attaches req.user when a valid Bearer token is present.
 * Does not reject unauthenticated requests.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type === "Bearer" && token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    } catch {
      // Ignore invalid token for optional auth.
    }
  }

  next();
}
