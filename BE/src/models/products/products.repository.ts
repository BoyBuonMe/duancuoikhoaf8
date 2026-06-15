import { isValidObjectId } from "mongoose";
import Product from "@/models/products/Product.model";
import ProductVariant, {
  type IProductVariant,
} from "@/models/products/ProductVariant.model";
import { buildTitleWordSearchFilter } from "@/models/products/product-search";

/**
 * Lean read for the cart pricing flow. Returns null when no active
 * variant matches the SKU.
 */
export async function findActiveVariantBySku(
  sku: string,
): Promise<Pick<IProductVariant, "sku" | "price"> | null> {
  return ProductVariant.findOne({ sku, isActive: true })
    .select("sku price")
    .lean();
}

/**
 * All active variants for a given product (by sourceUrl).
 */
export async function findVariantsBySourceUrl(sourceUrl: string) {
  return ProductVariant.find({ productSourceUrl: sourceUrl, isActive: true })
    .select("sku size price isActive")
    .lean();
}

/**
 * Recent products for the catalog landing.
 */
export async function findRecentProducts(limit: number) {
  return Product.find().sort({ createdAt: -1 }).limit(limit).lean();
}

export async function searchProductsByTitle(query: string, limit: number) {
  const filter = buildTitleWordSearchFilter(query);
  if (!filter) return [];

  return Product.find(filter)
    .sort({ scrapedAt: -1 })
    .limit(limit)
    .lean();
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildCategoryQuery(categoryFilters: string[]) {
  if (!categoryFilters.length) return {};
  return {
    $and: categoryFilters.map((f) => ({
      categories: new RegExp(`^${escapeRegex(f)}$`, "i"),
    })),
  };
}

export async function findProductsByCategories(
  categoryFilters: string[],
  limit: number,
  skip: number,
) {
  const query = buildCategoryQuery(categoryFilters);
  return Product.find(query)
    .sort({ scrapedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

export async function countProductsByCategories(categoryFilters: string[]) {
  const query = buildCategoryQuery(categoryFilters);
  return Product.countDocuments(query);
}

/**
 * Look a single product up by Mongo _id. Returns null when the id is
 * malformed or no doc matches, so callers can produce a 404 without
 * a try/catch around CastErrors.
 */
export async function findProductById(id: string) {
  if (!isValidObjectId(id)) return null;
  return Product.findById(id).lean();
}

/**
 * Look a single product up by its scraped sourceUrl. Useful when the
 * FE only has the unique URL of the source page (e.g. linked from
 * external content).
 */
export async function findProductBySourceUrl(sourceUrl: string) {
  return Product.findOne({ sourceUrl }).lean();
}

/**
 * Find a product by its URL slug (the path after /products/ in the sourceUrl).
 * Reconstructs the full Gymshark sourceUrl to do the lookup.
 */
export async function findProductBySlug(slug: string) {
  const sourceUrl = `https://www.gymshark.com/products/${slug}`;
  return Product.findOne({ sourceUrl }).lean();
}

export async function findVariantBySku(sku: string) {
  return ProductVariant.findOne({ sku }).lean();
}

export async function findActiveVariantsBySourceUrl(sourceUrl: string) {
  return ProductVariant.find({ productSourceUrl: sourceUrl, isActive: true })
    .select("sku")
    .lean();
}
