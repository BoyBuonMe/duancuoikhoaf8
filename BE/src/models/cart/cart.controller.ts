import type { NextFunction, Request, Response } from "express";
import * as cartService from "@/models/cart/cart.service";
import type {
  AddItemBody,
  ItemParams,
  UpdateItemBody,
} from "@/models/cart/cart.validation";

const EMPTY_CART_BODY = (email: string) => ({
  userEmail: email,
  items: [],
  subtotal: { amount: 0, currency: "USD" },
});

/** GET /api/cart — Lấy giỏ hàng của user hiện tại */
export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const email = req.user!.email;
    const cart = await cartService.getCart(email);
    if (!cart) return res.json(EMPTY_CART_BODY(email));
    res.json(cart);
  } catch (e) {
    next(e);
  }
}

/** POST /api/cart/items — Thêm item vào giỏ (nếu đã có sku thì cộng quantity) */
export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const email = req.user!.email;
    const { sku, quantity, name, image, variantLabel, productSlug } =
      req.body as AddItemBody;
    const cart = await cartService.addCartItem(
      email,
      sku,
      quantity,
      name,
      image,
      variantLabel,
      productSlug,
    );
    res.status(200).json(cart);
  } catch (e) {
    next(e);
  }
}

/** PATCH /api/cart/items/:sku — Cập nhật quantity của item */
export async function updateItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const { sku } = req.params as unknown as ItemParams;
    const { quantity } = req.body as UpdateItemBody;
    const cart = await cartService.updateCartItemQuantity(email, sku, quantity);
    res.json(cart);
  } catch (e) {
    next(e);
  }
}

/** DELETE /api/cart/items/:sku — Xoá một item khỏi giỏ */
export async function removeItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const { sku } = req.params as unknown as ItemParams;
    const cart = await cartService.removeCartItem(email, sku);
    res.json(cart);
  } catch (e) {
    next(e);
  }
}

/** DELETE /api/cart — Xoá toàn bộ giỏ hàng */
export async function clearCart(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const cart = await cartService.clearCart(email);
    if (!cart) return res.json(EMPTY_CART_BODY(email));
    res.json(cart);
  } catch (e) {
    next(e);
  }
}
