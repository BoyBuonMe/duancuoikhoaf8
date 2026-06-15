import { httpError } from "@/utils/http-error";
import * as cartRepo from "@/models/cart/cart.repository";
import * as productsRepo from "@/models/products/products.repository";

function slugFromSourceUrl(sourceUrl: string): string {
  const marker = "/products/";
  const idx = sourceUrl.indexOf(marker);
  if (idx >= 0) return sourceUrl.slice(idx + marker.length);
  return sourceUrl;
}

async function resolveProductSlugFromSku(
  sku: string,
): Promise<string | undefined> {
  const variant = await productsRepo.findVariantBySku(sku);
  if (variant?.productSourceUrl) {
    return slugFromSourceUrl(variant.productSourceUrl);
  }

  const idMatch = sku.match(/^([a-f\d]{24})/i);
  if (!idMatch) return undefined;

  const product = await productsRepo.findProductById(idMatch[1]);
  if (!product?.sourceUrl) return undefined;
  return slugFromSourceUrl(product.sourceUrl);
}

async function enrichCartItemSlugs(
  cart: NonNullable<Awaited<ReturnType<typeof cartRepo.findCartByEmail>>>,
) {
  let dirty = false;

  for (const item of cart.items) {
    if (item.productSlug) continue;
    const slug = await resolveProductSlugFromSku(item.sku);
    if (!slug) continue;
    item.productSlug = slug;
    dirty = true;
  }

  if (dirty) await cart.save();
}

export async function getCart(email: string) {
  const cart = await cartRepo.findCartByEmail(email);
  if (!cart) return null;
  await enrichCartItemSlugs(cart);
  return cart;
}

export async function addCartItem(
  email: string,
  sku: string,
  quantity: number,
  name: string,
  image: string,
  variantLabel?: string,
  productSlug?: string,
) {
  // Server-side price lookup: prefer ProductVariant price, fall back to Product price.
  const variant = await productsRepo.findActiveVariantBySku(sku);
  let unitPrice: { amount: number; currency: string };

  if (variant) {
    unitPrice = variant.price;
  } else {
    // Fallback: placeholder SKU format is `${productId}-${sizeId}`.
    // Extract the ObjectId prefix (24 hex chars) and look up the product.
    const idMatch = sku.match(/^([a-f\d]{24})/i);
    if (!idMatch) throw httpError("Variant not found", 404);
    const product = await productsRepo.findProductById(idMatch[1]);
    if (!product) throw httpError("Product not found", 404);
    unitPrice = product.price;
  }

  const resolvedProductSlug =
    productSlug ?? (await resolveProductSlugFromSku(sku));

  const cart = await cartRepo.findOrInitCart(email);
  const existing = cart.items.find((i) => i.sku === sku);
  if (existing) {
    existing.quantity += quantity;
    existing.unitPrice = unitPrice;
    existing.name = name;
    existing.image = image;
    if (variantLabel !== undefined) existing.variantLabel = variantLabel;
    if (resolvedProductSlug) existing.productSlug = resolvedProductSlug;
  } else {
    cart.items.push({
      sku,
      quantity,
      unitPrice,
      name,
      image,
      variantLabel,
      productSlug: resolvedProductSlug,
    });
  }
  return cart.save();
}

export async function updateCartItemQuantity(
  email: string,
  sku: string,
  quantity: number,
) {
  const cart = await cartRepo.findCartByEmail(email);
  if (!cart) throw httpError("Cart not found", 404);

  const item = cart.items.find((i) => i.sku === sku);
  if (!item) throw httpError("Item not found in cart", 404);

  item.quantity = quantity;
  return cart.save();
}

export async function removeCartItem(email: string, sku: string) {
  const cart = await cartRepo.findCartByEmail(email);
  if (!cart) throw httpError("Cart not found", 404);

  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.sku !== sku) as typeof cart.items;
  if (cart.items.length === before) {
    throw httpError("Item not found in cart", 404);
  }

  return cart.save();
}

export async function clearCart(email: string) {
  const cart = await cartRepo.findCartByEmail(email);
  if (!cart) return null;
  cart.items = [] as typeof cart.items;
  return cart.save();
}

export async function removeCartItemsBySkus(email: string, skus: string[]) {
  if (skus.length === 0) return null;
  const cart = await cartRepo.findCartByEmail(email);
  if (!cart) return null;

  const skuSet = new Set(skus.map((sku) => sku.trim()).filter(Boolean));
  cart.items = cart.items.filter((item) => !skuSet.has(item.sku)) as typeof cart.items;
  return cart.save();
}
