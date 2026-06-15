import { httpError } from "@/utils/http-error";
import * as productsRepo from "@/models/products/products.repository";
import * as wishlistRepo from "@/models/wishlist/wishlist.repository";

export interface EnrichedWishlistItem {
  sku?: string;
  productId: string;
  addedAt: Date;
  product: {
    _id: string;
    sourceUrl: string;
    title: string;
    price: { amount: number; currency: string };
    imageUrls: string[];
    localImagePaths: string[];
    categories: string[];
    scrapedAt: Date;
  };
}

type WishlistItemInput = { productId?: string; sku?: string; addedAt: Date };

async function resolveItemProductId(
  item: WishlistItemInput,
): Promise<string | null> {
  if (item.productId) return item.productId;

  if (!item.sku) return null;

  const variant = await productsRepo.findVariantBySku(item.sku);
  if (!variant) return null;

  const product = await productsRepo.findProductBySourceUrl(
    variant.productSourceUrl,
  );
  return product ? String(product._id) : null;
}

async function productFromItem(item: WishlistItemInput) {
  if (item.productId) {
    return productsRepo.findProductById(item.productId);
  }

  if (!item.sku) return null;

  const variant = await productsRepo.findVariantBySku(item.sku);
  if (!variant) return null;

  return productsRepo.findProductBySourceUrl(variant.productSourceUrl);
}

function serializeProduct(product: {
  _id: unknown;
  sourceUrl: string;
  title: string;
  price: { amount: number; currency: string };
  imageUrls?: string[];
  localImagePaths?: string[];
  categories?: string[];
  scrapedAt: Date;
}) {
  const productId = String(product._id);
  return {
    _id: productId,
    sourceUrl: product.sourceUrl,
    title: product.title,
    price: product.price,
    imageUrls: product.imageUrls ?? [],
    localImagePaths: product.localImagePaths ?? [],
    categories: product.categories ?? [],
    scrapedAt: product.scrapedAt,
  };
}

export async function enrichWishlistItems(
  items: WishlistItemInput[],
): Promise<EnrichedWishlistItem[]> {
  const enriched: EnrichedWishlistItem[] = [];
  const seenProductIds = new Set<string>();

  for (const item of items) {
    const product = await productFromItem(item);
    if (!product) continue;

    const productId = String(product._id);
    if (seenProductIds.has(productId)) continue;
    seenProductIds.add(productId);

    enriched.push({
      sku: item.sku,
      productId,
      addedAt: item.addedAt,
      product: serializeProduct(product),
    });
  }

  return enriched;
}

async function wishlistHasProductId(
  items: WishlistItemInput[],
  productId: string,
) {
  for (const item of items) {
    const resolved = await resolveItemProductId(item);
    if (resolved === productId) return true;
  }
  return false;
}

async function removeProductFromItems(
  items: WishlistItemInput[],
  productId: string,
) {
  const next: WishlistItemInput[] = [];
  for (const item of items) {
    const resolved = await resolveItemProductId(item);
    if (resolved !== productId) next.push(item);
  }
  return next;
}

export async function getWishlist(email: string) {
  const wishlist = await wishlistRepo.findWishlistByEmail(email);
  if (!wishlist) {
    return { userEmail: email, items: [], updatedAt: null };
  }

  const items = await enrichWishlistItems(wishlist.items);
  return {
    userEmail: wishlist.userEmail,
    items,
    updatedAt: wishlist.updatedAt,
  };
}

export async function toggleWishlistItem(email: string, productId: string) {
  const product = await productsRepo.findProductById(productId);
  if (!product) throw httpError("Product not found", 404);

  const normalizedId = String(product._id);
  const wishlist = await wishlistRepo.findOrInitWishlist(email);
  const hasProduct = await wishlistHasProductId(wishlist.items, normalizedId);

  if (hasProduct) {
    wishlist.items = (await removeProductFromItems(
      wishlist.items,
      normalizedId,
    )) as typeof wishlist.items;
  } else {
    wishlist.items.push({
      productId: normalizedId,
      addedAt: new Date(),
    });
  }

  await wishlist.save();
  const items = await enrichWishlistItems(wishlist.items);
  return {
    userEmail: wishlist.userEmail,
    items,
    updatedAt: wishlist.updatedAt,
    wishlisted: !hasProduct,
    productId: normalizedId,
  };
}

export async function removeWishlistItem(email: string, productId: string) {
  const product = await productsRepo.findProductById(productId);
  if (!product) throw httpError("Product not found", 404);

  const normalizedId = String(product._id);
  const wishlist = await wishlistRepo.findWishlistByEmail(email);
  if (!wishlist) throw httpError("Wishlist not found", 404);

  const before = wishlist.items.length;
  wishlist.items = (await removeProductFromItems(
    wishlist.items,
    normalizedId,
  )) as typeof wishlist.items;
  if (wishlist.items.length === before) {
    throw httpError("Item not found in wishlist", 404);
  }

  await wishlist.save();
  const items = await enrichWishlistItems(wishlist.items);
  return {
    userEmail: wishlist.userEmail,
    items,
    updatedAt: wishlist.updatedAt,
  };
}

export async function clearWishlist(email: string) {
  const wishlist = await wishlistRepo.findWishlistByEmail(email);
  if (!wishlist) return { userEmail: email, items: [], updatedAt: null };

  wishlist.items = [] as typeof wishlist.items;
  await wishlist.save();
  return {
    userEmail: wishlist.userEmail,
    items: [],
    updatedAt: wishlist.updatedAt,
  };
}
