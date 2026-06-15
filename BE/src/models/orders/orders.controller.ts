import type { NextFunction, Request, Response } from "express";
import * as ordersService from "@/models/orders/orders.service";
import type {
  CreateOrderBody,
  OrderCodeParams,
} from "@/models/orders/orders.validation";

/** GET /api/orders — Danh sách đơn hàng của user hiện tại */
export async function listOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const orders = await ordersService.listOrders(email);
    res.json({ orders });
  } catch (e) {
    next(e);
  }
}

/** GET /api/orders/:orderCode — Chi tiết một đơn hàng */
export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const { orderCode } = req.params as unknown as OrderCodeParams;
    const order = await ordersService.getOrder(email, orderCode);
    res.json({ order });
  } catch (e) {
    next(e);
  }
}

/** POST /api/orders — Tạo đơn hàng mới (sau checkout) */
export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const body = req.body as CreateOrderBody;
    const order = await ordersService.createOrder(email, body);
    res.status(201).json({ order });
  } catch (e) {
    next(e);
  }
}
