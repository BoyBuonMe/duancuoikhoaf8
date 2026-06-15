import type { NextFunction, Request, Response } from "express";
import * as discountCodesService from "@/models/discount-codes/discount-codes.service";

export async function applyDiscountCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code, subtotal } = req.body as {
      code: string;
      subtotal: number;
    };
    const result = await discountCodesService.validateDiscountCodeForCheckout({
      code,
      subtotal,
    });
    res.json({ discountCode: result });
  } catch (e) {
    next(e);
  }
}
