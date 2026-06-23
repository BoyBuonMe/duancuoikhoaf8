import mongoose from "mongoose";
import Category from "@/models/categories/Category.model";
import ProductRating from "@/models/products/ProductRating.model";
import ProductVariant from "@/models/products/ProductVariant.model";
import { pathSegmentsToProductTags } from "@/models/products/product-categories";
import * as productsRepo from "@/models/products/products.repository";
import { httpError } from "@/utils/http-error";

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
    ? pathSegmentsToProductTags(category.pathSegments)
    : [];
  const categorySlugs = category
    ? await Category.distinct("slug", {
        level: { $gte: category.level },
        ...Object.fromEntries(
          category.pathSegments.map((segment, index) => [
            `pathSegments.${index}`,
            segment,
          ]),
        ),
      })
    : [];

  const [products, total] = await Promise.all([
    productsRepo.findProductsByCategoryPlacement(
      categorySlugs,
      filters,
      limit,
      skip,
    ),
    productsRepo.countProductsByCategoryPlacement(categorySlugs, filters),
  ]);

  return { products, total, filters };
}

export async function getProductById(id: string) {
  const product = await productsRepo.findProductById(id);
  if (!product) throw httpError("Product not found", 404);

  const variants = await ProductVariant.find({
    productSourceUrl: product.sourceUrl,
    isActive: true,
  }).lean();

  const skus = variants.map((variant) => variant.sku);
  const db = mongoose.connection.db;
  const inventoryItems = db
    ? await db
        .collection("inventory")
        .find({ sku: { $in: skus } })
        .toArray()
    : [];
  const inventoryMap = new Map(inventoryItems.map((item) => [item.sku, item]));

  const sizeSlugs = [
    ...new Set(variants.map((variant) => variant.size).filter(Boolean)),
  ];
  const sizeDocs = db
    ? await db
        .collection("sizes")
        .find({ slug: { $in: sizeSlugs } })
        .toArray()
    : [];
  const sizeMap = new Map(sizeDocs.map((size) => [size.slug, size]));

  const sizes = variants.map((variant) => {
    const sizeSlug = variant.size || "one-size";
    const sizeDoc = sizeMap.get(sizeSlug);
    const inventoryDoc = inventoryMap.get(variant.sku);
    const inStock = inventoryDoc
      ? inventoryDoc.status !== "out_of_stock" &&
        inventoryDoc.quantity - inventoryDoc.reserved > 0
      : false;

    return {
      id: sizeSlug,
      label: sizeDoc?.name || sizeSlug.toUpperCase().replace("-", " "),
      inStock,
      sku: variant.sku,
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
    { upsert: true, new: true },
  );

  return getProductRatingStats(productId);
}

export async function getProductBySlug(slug: string) {
  const product = await productsRepo.findProductBySlug(slug);
  if (!product) throw httpError("Product not found", 404);
  return getProductById(String(product._id));
}
