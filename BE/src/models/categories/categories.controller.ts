import type { NextFunction, Request, Response } from "express";
import Category from "@/models/categories/Category.model";

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { level, parentSlug } = req.query;

    const filter: Record<string, unknown> = {};
    if (level !== undefined) filter.level = Number(level);
    if (parentSlug !== undefined) filter.parentSlug = parentSlug;

    const categories = await Category.find(filter)
      .sort({ level: 1, productCount: -1 })
      .lean();

    res.json({ categories, count: categories.length });
  } catch (e) {
    next(e);
  }
}
