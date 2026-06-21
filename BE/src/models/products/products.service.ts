import { httpError } from "@/utils/http-error";
import * as productsRepo from "@/models/products/products.repository";
import Category from "@/models/categories/Category.model";

// Maps level-0 nav names to the product category gender tag
const GENDER_MAP: Record<string, string> = {
  Women: "Womens",
  Men: "Mens",
  Accessories: "Unisex",
};

// Nav-only section labels that don't correspond to product category names
const NAV_ONLY_LABELS = new Set([
  "Products",
  "Trending",
  "Last Chance",
  "Explore",
  "Equipment",
  "T-Shirts & Tops",
  "Underwear",
  "Bags",
  "Socks",
  "Headwear",
]);

// Patterns that are editorial/curated — not product category names
const EDITORIAL_PATTERN =
  /^(All\s|New Product Drops|Best Sellers|Spring Looks|Seasonal|Pilates|Running|Lifting|For Less|Accessories For Less|New to Gymshark)/i;

function pathSegmentsToProductFilter(segments: string[]): string[] {
  if (!segments.length) return [];

  const filters: string[] = [];

  // First segment is always the gender/top-level
  const gender = GENDER_MAP[segments[0]];
  if (gender) filters.push(gender);

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const isLeaf = i === segments.length - 1;

    // Editorial group labels apply only at leaf level (e.g. Trending > Pilates).
    if (!isLeaf && EDITORIAL_PATTERN.test(seg)) continue;
    if (/\bGuide\b/i.test(seg)) continue;
    if (/^All\s/i.test(seg)) continue;
    if (seg.endsWith("?")) continue;
    if (NAV_ONLY_LABELS.has(seg)) continue;
    filters.push(seg);
  }

  return filters;
}

export async function listRecentProducts(limit = 10) {
  return productsRepo.findRecentProducts(limit);
}

export async function searchProducts(query: string, limit = 10) {
  return productsRepo.searchProductsByTitle(query, limit);
}

export async function listProductsByCategory(
  categorySlug: string,
  limit: number,
  skip: number,
) {
  const category = await Category.findOne({ slug: categorySlug }).lean();
  const filters = category
    ? pathSegmentsToProductFilter(category.pathSegments)
    : [];

  const [products, total] = await Promise.all([
    productsRepo.findProductsByCategories(filters, limit, skip),
    productsRepo.countProductsByCategories(filters),
  ]);

  return { products, total, filters };
}

import ProductVariant from "@/models/products/ProductVariant.model";
import ProductRating from "@/models/products/ProductRating.model";
import mongoose from "mongoose";

export async function getProductById(id: string) {
  const product = await productsRepo.findProductById(id);
  if (!product) throw httpError("Product not found", 404);

  const variants = await ProductVariant.find({
    productSourceUrl: product.sourceUrl,
    isActive: true,
  }).lean();

  const skus = variants.map((v) => v.sku);
  const db = mongoose.connection.db;
  const inventoryItems = db
    ? await db
        .collection("inventory")
        .find({ sku: { $in: skus } })
        .toArray()
    : [];
  const inventoryMap = new Map(inventoryItems.map((item) => [item.sku, item]));

  const sizeSlugs = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const sizeDocs = db
    ? await db
        .collection("sizes")
        .find({ slug: { $in: sizeSlugs } })
        .toArray()
    : [];
  const sizeMap = new Map(sizeDocs.map((s) => [s.slug, s]));

  const sizes = variants.map((v) => {
    const sizeSlug = v.size || "one-size";
    const sizeDoc = sizeMap.get(sizeSlug);
    const inventoryDoc = inventoryMap.get(v.sku);
    const inStock = inventoryDoc
      ? inventoryDoc.status !== "out_of_stock" &&
        inventoryDoc.quantity - inventoryDoc.reserved > 0
      : false;

    return {
      id: sizeSlug,
      label: sizeDoc?.name || sizeSlug.toUpperCase().replace("-", " "),
      inStock,
      sku: v.sku,
    };
  });

  sizes.sort((a, b) => {
    const orderA = sizeMap.get(a.id)?.order || 99;
    const orderB = sizeMap.get(b.id)?.order || 99;
    return orderA - orderB;
  });

  const genderTag = product.categories[0] || "Men's";
  const catTag = product.categories[2] || "Training";
  const descTag = `${genderTag} ${catTag}`;

  const ratingStats = await getProductRatingStats(id);

  return {
    ...product,
    description: `Built to perform, designed to last. The ${product.title} features a durable fabric blend and a fit that moves with you. Perfect for high intensity training.`,
    descTag,
    sizes,
    ratingAverage: ratingStats.ratingAverage,
    ratingCount: ratingStats.ratingCount,
  };
}

export async function getProductRatingStats(productId: string) {
  const stats = await ProductRating.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        ratingAverage: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  return {
    ratingAverage: stats[0]?.ratingAverage
      ? Math.round(stats[0].ratingAverage * 10) / 10
      : 0,
    ratingCount: stats[0]?.ratingCount ?? 0,
  };
}

export async function rateProduct(
  productId: string,
  userId: string,
  rating: number,
) {
  if (rating < 1 || rating > 5) {
    throw httpError("Rating must be between 1 and 5", 400);
  }

  await ProductRating.findOneAndUpdate(
    {
      productId: new mongoose.Types.ObjectId(productId),
      userId: new mongoose.Types.ObjectId(userId),
    },
    { rating },
    { upsert: true, returnDocument: "after" },
  );

  return getProductRatingStats(productId);
}

/**
 * Same enrichment as getProductById but looks up by URL slug instead of _id.
 */
export async function getProductBySlug(slug: string) {
  const product = await productsRepo.findProductBySlug(slug);
  if (!product) throw httpError("Product not found", 404);
  // Reuse the same enrichment logic via getProductById
  return getProductById(String(product._id));
}
