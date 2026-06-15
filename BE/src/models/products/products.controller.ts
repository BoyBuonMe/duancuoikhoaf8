import type { NextFunction, Request, Response } from "express";
import * as productsService from "@/models/products/products.service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { categorySlug, limit: l, skip: s, q } = req.query as Record<
      string,
      string | undefined
    >;

    const limit = Math.min(Number(l) || DEFAULT_LIMIT, MAX_LIMIT);
    const skip = Math.max(Number(s) || 0, 0);

    const searchQuery = q?.trim();
    if (searchQuery) {
      const products = await productsService.searchProducts(searchQuery, limit);
      return res.json({ products, total: products.length, limit, skip: 0 });
    }

    if (categorySlug) {
      const result = await productsService.listProductsByCategory(
        categorySlug,
        limit,
        skip,
      );
      return res.json({ ...result, limit, skip });
    }

    const products = await productsService.listRecentProducts(limit);
    res.json({ products, total: products.length, limit, skip });
  } catch (e) {
    next(e);
  }
}

export async function getProductBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { slug } = req.params as { slug: string };
    const product = await productsService.getProductBySlug(slug);
    res.json({ product });
  } catch (e) {
    next(e);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const product = await productsService.getProductById(id);
    res.json({ product });
  } catch (e) {
    next(e);
  }
}

export async function rateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { rating } = req.body as { rating: number };
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const stats = await productsService.rateProduct(id, userId, Number(rating));
    res.json({ message: "Rating submitted successfully", ...stats });
  } catch (e) {
    next(e);
  }
}

