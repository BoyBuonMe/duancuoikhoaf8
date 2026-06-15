import type { NextFunction, Request, Response } from "express";
import User from "@/models/users/User.model";
import * as usersService from "@/models/users/users.service";
import { httpError } from "@/utils/http-error";

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) {
      throw httpError("Unauthorized", 401);
    }

    const user = await User.findById(req.user.id).select(
      "email name phone role status emailVerified createdAt",
    );
    if (!user) {
      throw httpError("User not found", 404);
    }

    res.json({ user });
  } catch (e) {
    next(e);
  }
}

/** GET /api/users/me/tell — Số điện thoại (field `tell`) của user hiện tại */
export async function getTell(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.email) {
      throw httpError("Unauthorized", 401);
    }

    const tell = await usersService.getUserTellByEmail(req.user.email);
    res.json({ tell });
  } catch (e) {
    next(e);
  }
}
