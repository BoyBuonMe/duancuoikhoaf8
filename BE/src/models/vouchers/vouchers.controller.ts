import type { NextFunction, Request, Response } from "express";
import * as vouchersService from "@/models/vouchers/vouchers.service";

export async function getApplicableVouchers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const productIds = req.query.productIds
      ? String(req.query.productIds)
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];
    const subtotal = Number(req.query.subtotal) || 0;

    const vouchers = await vouchersService.listApplicableVouchers(
      productIds,
      subtotal,
      req.user?.id,
    );
    res.json({ vouchers });
  } catch (e) {
    next(e);
  }
}
