import mongoose from "mongoose";
import Product from "@/models/products/Product.model";
import ProductVariant from "@/models/products/ProductVariant.model";

/**
 * Live product retrieval for the AI assistant (lightweight RAG).
 *
 * The model has no DB/file access, so before each AI reply we look up the
 * products the customer is most likely asking about and feed their real
 * price + per-size stock back into the prompt. This grounds answers about
 * "còn hàng không / giá bao nhiêu / gợi ý sản phẩm" in the actual catalog
 * instead of letting the model guess.
 */

const MAX_PRODUCTS = 6;
const MAX_CANDIDATES = 24;

// Tokens that carry no product signal — dropped before searching titles.
// Titles/categories are English, so we also strip the most common Vietnamese
// filler words a customer might type around an English product name.
const STOPWORDS = new Set([
  // English
  "the", "a", "an", "and", "or", "of", "for", "to", "in", "on", "with", "is",
  "are", "do", "you", "have", "any", "this", "that", "it", "size", "color",
  "colour", "price", "cost", "much", "stock", "available", "product", "item",
  "please", "can", "i", "my", "me", "want", "need", "looking", "buy",
  // Vietnamese
  "co", "con", "khong", "ko", "gia", "bao", "nhieu", "hang", "san", "pham",
  "mua", "muon", "minh", "ban", "cho", "toi", "nay", "do", "size", "mau",
  "loai", "the", "la", "gi", "voi", "va", "hay", "goi", "y", "phu", "hop",
]);

interface SizeStock {
  size: string;
  sku: string;
  inStock: boolean;
  available: number;
}

export interface ProductSnapshot {
  title: string;
  price: string;
  categories: string[];
  sizes: SizeStock[];
  anyInStock: boolean;
  link: string;
}

// Storefront base URL the customer browses (NOT the scraped gymshark.com).
// Falls back to localhost for local dev.
const STORE_BASE_URL = (
  process.env.APP_ORIGIN ?? "http://localhost:3000"
)
  .split(",")[0]
  .trim()
  .replace(/\/$/, "");

/**
 * Build the on-store product link the FE uses: `/products/{slug}` where slug is
 * the path after `/products/` in the scraped sourceUrl. Mirrors
 * FE `productSlugFromSourceUrl`.
 */
function productLinkFromSourceUrl(sourceUrl: string): string {
  const marker = "/products/";
  let slug = sourceUrl;
  try {
    const pathname = new URL(sourceUrl).pathname;
    const idx = pathname.indexOf(marker);
    if (idx >= 0) slug = pathname.slice(idx + marker.length);
  } catch {
    const idx = sourceUrl.indexOf(marker);
    if (idx >= 0) slug = sourceUrl.slice(idx + marker.length);
  }
  return `${STORE_BASE_URL}/products/${slug}`;
}

function stripDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Extract meaningful, de-accented search tokens from a free-form message. */
export function extractKeywords(message: string): string[] {
  const tokens = stripDiacritics(message.toLowerCase())
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

  // De-dupe while preserving order.
  return [...new Set(tokens)];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatPrice(price?: { amount: number; currency: string }): string {
  if (!price) return "N/A";
  return `${price.amount} ${price.currency}`;
}

/**
 * Rank candidate products by how many distinct keywords appear in the title,
 * keeping only the strongest matches. Falls back to recency (scrapedAt).
 */
function rankByKeywordHits<T extends { title: string; scrapedAt?: Date }>(
  products: T[],
  keywords: string[],
): T[] {
  return [...products]
    .map((p) => {
      const haystack = stripDiacritics(p.title.toLowerCase());
      const hits = keywords.filter((k) => haystack.includes(k)).length;
      return { p, hits };
    })
    .sort((a, b) => {
      if (b.hits !== a.hits) return b.hits - a.hits;
      const ta = a.p.scrapedAt ? new Date(a.p.scrapedAt).getTime() : 0;
      const tb = b.p.scrapedAt ? new Date(b.p.scrapedAt).getTime() : 0;
      return tb - ta;
    })
    .map((x) => x.p);
}

async function loadStockBySku(
  skus: string[],
): Promise<Map<string, { inStock: boolean; available: number }>> {
  const map = new Map<string, { inStock: boolean; available: number }>();
  const db = mongoose.connection.db;
  if (!db || skus.length === 0) return map;

  const items = await db
    .collection("inventory")
    .find({ sku: { $in: skus } })
    .toArray();

  for (const item of items) {
    const available = (item.quantity ?? 0) - (item.reserved ?? 0);
    const inStock = item.status !== "out_of_stock" && available > 0;
    map.set(item.sku, { inStock, available: Math.max(0, available) });
  }
  return map;
}

async function buildSnapshots(
  products: Array<{
    title: string;
    sourceUrl: string;
    price?: { amount: number; currency: string };
    categories?: string[];
  }>,
): Promise<ProductSnapshot[]> {
  const sourceUrls = products.map((p) => p.sourceUrl);

  const variants = await ProductVariant.find({
    productSourceUrl: { $in: sourceUrls },
    isActive: true,
  })
    .select("sku size price productSourceUrl")
    .lean();

  const stockBySku = await loadStockBySku(variants.map((v) => v.sku));

  const variantsByProduct = new Map<string, typeof variants>();
  for (const v of variants) {
    const list = variantsByProduct.get(v.productSourceUrl) ?? [];
    list.push(v);
    variantsByProduct.set(v.productSourceUrl, list);
  }

  return products.map((p) => {
    const pv = variantsByProduct.get(p.sourceUrl) ?? [];
    const sizes: SizeStock[] = pv.map((v) => {
      const stock = stockBySku.get(v.sku);
      return {
        size: (v.size || "one-size").toUpperCase(),
        sku: v.sku,
        inStock: stock?.inStock ?? false,
        available: stock?.available ?? 0,
      };
    });

    return {
      title: p.title,
      price: formatPrice(p.price),
      categories: p.categories ?? [],
      sizes,
      anyInStock: sizes.some((s) => s.inStock),
      link: productLinkFromSourceUrl(p.sourceUrl),
    };
  });
}

/**
 * Find the products most relevant to the customer's message and return their
 * live price + per-size stock. When nothing matches (e.g. a vague request for
 * suggestions), falls back to recent catalog items so the assistant always has
 * real products to recommend.
 */
export async function getRelevantProducts(
  message: string,
): Promise<ProductSnapshot[]> {
  const keywords = extractKeywords(message);

  let candidates: Array<{
    title: string;
    sourceUrl: string;
    price?: { amount: number; currency: string };
    categories?: string[];
    scrapedAt?: Date;
  }> = [];

  if (keywords.length > 0) {
    candidates = await Product.find({
      $or: keywords.map((k) => ({
        title: new RegExp(escapeRegex(k), "i"),
      })),
    })
      .select("title sourceUrl price categories scrapedAt")
      .limit(MAX_CANDIDATES)
      .lean();
  }

  const ranked = rankByKeywordHits(candidates, keywords).slice(0, MAX_PRODUCTS);

  // Keyword path: customer asked about specific products. Return them as-is —
  // including out-of-stock ones — so the assistant can correctly answer
  // "còn hàng không?" with "hết hàng" when that's the truth.
  if (ranked.length > 0) {
    return buildSnapshots(ranked);
  }

  // Suggestion path (no keyword hit, e.g. "gợi ý cho mình vài cái shorts"):
  // only recommend products that actually have a size in stock. Pull a wider
  // recent slice, then filter to in-stock before trimming.
  const recent = await Product.find()
    .sort({ scrapedAt: -1 })
    .limit(MAX_CANDIDATES)
    .select("title sourceUrl price categories scrapedAt")
    .lean();

  const snapshots = await buildSnapshots(recent);
  return snapshots.filter((p) => p.anyInStock).slice(0, MAX_PRODUCTS);
}

/** Render product snapshots into a compact, token-frugal context block. */
export function formatProductContext(products: ProductSnapshot[]): string {
  if (products.length === 0) return "";

  const lines = products.map((p, i) => {
    const inStockSizes = p.sizes.filter((s) => s.inStock);
    const sizeStr =
      p.sizes.length === 0
        ? "no size data"
        : inStockSizes.length > 0
          ? inStockSizes
              .map((s) => `${s.size} (in stock: ${s.available})`)
              .join(", ")
          : "all sizes out of stock";
    const cats = p.categories.slice(0, 4).join(", ") || "—";
    return (
      `${i + 1}. ${p.title} | Price: ${p.price} | Categories: ${cats}\n` +
      `   Sizes: ${sizeStr}\n` +
      `   Link: ${p.link}`
    );
  });

  return (
    "=== LIVE STORE DATA (current price & stock from the database) ===\n" +
    lines.join("\n") +
    "\n=== END STORE DATA ==="
  );
}

/** One-shot helper: message → ready-to-inject context string ("" if none). */
export async function buildProductContext(message: string): Promise<string> {
  const products = await getRelevantProducts(message);
  return formatProductContext(products);
}
