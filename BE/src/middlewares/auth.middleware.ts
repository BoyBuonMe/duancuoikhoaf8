import type { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import RefreshToken from "@/models/auth/Auth.model";
import { verifyRefreshToken, verifyToken } from "@/utils/jwt";
import User from "@/models/users/User.model";
import { httpError } from "@/utils/http-error";

const DASHBOARD_ROLES = new Set(["admin", "boss"]);
const REFRESH_COOKIE = "refreshToken";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type === "Bearer" && token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
      next();
      return;
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  }

  try {
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    const refreshToken = cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      res.status(401).json({ message: "Missing or invalid Authorization header" });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const stored = await RefreshToken.findOne({
      tokenHash: hashToken(refreshToken),
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!stored) {
      res.status(401).json({ message: "Refresh token revoked" });
      return;
    }

    const user = await User.findById(payload.sub)
      .select("email role")
      .lean();
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = { id: payload.sub, email: user.email, role: user.role };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) {
      throw httpError("Unauthorized", 401);
    }

    if (req.user.role && DASHBOARD_ROLES.has(req.user.role)) {
      next();
      return;
    }

    const user = await User.findById(req.user.id).select("role").lean();
    if (!user || !DASHBOARD_ROLES.has(user.role)) {
      throw httpError("Admin access required", 403);
    }

    req.user.role = user.role;
    next();
  } catch (e) {
    next(e);
  }
}

export async function requireBoss(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.id) {
      throw httpError("Unauthorized", 401);
    }

    if (req.user.role === "boss") {
      next();
      return;
    }

    const user = await User.findById(req.user.id).select("role").lean();
    if (!user || user.role !== "boss") {
      throw httpError("Boss access required", 403);
    }

    req.user.role = "boss";
    next();
  } catch (e) {
    next(e);
  }
}
