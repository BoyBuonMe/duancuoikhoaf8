import type { CartItem } from "@/features/cart/model/cart.types";
import type { Product } from "@/features/products/model/product.types";

const FALLBACK_SIZE = { id: "m", label: "M" };

export function buildCartItemFromProduct(
  product: Product,
  slug: string,
  preferredSku?: string,
): CartItem {
  if (product.sizes?.length) {
    if (preferredSku) {
      const size = product.sizes.find((s) => s.sku === preferredSku);
      if (size) {
        return {
          sku: size.sku,
          name: product.title,
          image: product.imageUrls[0] ?? "",
          variantLabel: size.label,
          productSlug: slug,
          quantity: 1,
          unitPrice: product.price,
        };
      }
    }

    const size =
      product.sizes.find((s) => s.inStock) ?? product.sizes[0] ?? null;
    if (size) {
      return {
        sku: size.sku,
        name: product.title,
        image: product.imageUrls[0] ?? "",
        variantLabel: size.label,
        productSlug: slug,
        quantity: 1,
        unitPrice: product.price,
      };
    }
  }

  return {
    sku: `${product._id}-${FALLBACK_SIZE.id}`,
    name: product.title,
    image: product.imageUrls[0] ?? "",
    variantLabel: FALLBACK_SIZE.label,
    productSlug: slug,
    quantity: 1,
    unitPrice: product.price,
  };
}
