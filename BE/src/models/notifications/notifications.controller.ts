import type { NextFunction, Request, Response } from "express";
import * as notificationsService from "@/models/notifications/notifications.service";

export async function listNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const limit = Number(req.query.limit ?? 20);
    const result = await notificationsService.listDashboardNotifications(
      req.user!.id,
      req.user!.role,
      limit,
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const notification = await notificationsService.markNotificationRead(
      req.user!.id,
      req.user!.role,
      String(req.params.id),
    );
    res.json({ notification });
  } catch (e) {
    next(e);
  }
}

export async function markAllRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await notificationsService.markAllNotificationsRead(
      req.user!.id,
      req.user!.role,
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}
