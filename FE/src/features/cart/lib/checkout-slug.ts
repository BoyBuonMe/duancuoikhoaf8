import type { CartItem } from "@/features/cart/model/cart.types";
import type { Product } from "@/features/products/model/product.types";

export function productIdFromSku(sku: string): string | null {
  const match = sku.match(/^([a-f\d]{24})(?:-|$)/i);
  return match ? match[1] : null;
}

export function resolveCartItemCheckoutSlug(
  item: CartItem,
  productsBySlug: Record<string, Product>,
): string | null {
  if (item.productSlug) return item.productSlug;

  const productId = productIdFromSku(item.sku);
  if (productId) {
    for (const [slug, product] of Object.entries(productsBySlug)) {
      if (product._id === productId) return slug;
    }
  }

  for (const [slug, product] of Object.entries(productsBySlug)) {
    if (product.title === item.name) return slug;
    if (
      product.sizes?.some((size) => size.sku === item.sku)
    ) {
      return slug;
    }
    if (productId && product._id === productId) return slug;
    if (item.sku.startsWith(`${product._id}-`)) return slug;
  }

  return null;
}

export function resolveFirstCheckoutSlugFromCart(
  items: CartItem[],
  productsBySlug: Record<string, Product>,
): string | null {
  for (const item of items) {
    const slug = resolveCartItemCheckoutSlug(item, productsBySlug);
    if (slug) return slug;
  }
  return null;
}

export function resolveCartItemProductHref(
  item: CartItem,
  productsBySlug: Record<string, Product>,
): string | null {
  const slug = resolveCartItemCheckoutSlug(item, productsBySlug);
  return slug ? `/products/${slug}` : null;
}
