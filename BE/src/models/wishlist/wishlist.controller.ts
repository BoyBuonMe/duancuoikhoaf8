import type { NextFunction, Request, Response } from "express";
import * as wishlistService from "@/models/wishlist/wishlist.service";
import type {
  ProductIdBody,
  ProductIdParams,
} from "@/models/wishlist/wishlist.validation";

const EMPTY_WISHLIST_BODY = (email: string) => ({
  userEmail: email,
  items: [],
  updatedAt: null,
});

/** GET /api/wishlist — Lấy wishlist của user hiện tại */
export async function getWishlist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const wishlist = await wishlistService.getWishlist(email);
    if (!wishlist.updatedAt) return res.json(EMPTY_WISHLIST_BODY(email));
    res.json(wishlist);
  } catch (e) {
    next(e);
  }
}

/** POST /api/wishlist/items — Toggle sản phẩm trong wishlist */
export async function toggleItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const { productId } = req.body as ProductIdBody;
    const wishlist = await wishlistService.toggleWishlistItem(email, productId);
    res.status(200).json(wishlist);
  } catch (e) {
    next(e);
  }
}

/** DELETE /api/wishlist/items/:productId — Xóa sản phẩm khỏi wishlist */
export async function removeItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const { productId } = req.params as ProductIdParams;
    const wishlist = await wishlistService.removeWishlistItem(email, productId);
    res.json(wishlist);
  } catch (e) {
    next(e);
  }
}

/** DELETE /api/wishlist — Xóa toàn bộ wishlist */
export async function clearWishlist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = req.user!.email;
    const wishlist = await wishlistService.clearWishlist(email);
    res.json(wishlist);
  } catch (e) {
    next(e);
  }
}
