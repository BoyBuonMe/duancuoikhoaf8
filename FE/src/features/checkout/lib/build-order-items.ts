import { productIdFromSku } from "@/features/cart/lib/checkout-slug";
import type { CartItem } from "@/features/cart/model/cart.types";
import { productSlugFromSourceUrl } from "@/features/products/lib/product-slug";
import type { Product } from "@/features/products/model/product.types";
import type { CheckoutLineState } from "@/components/pages/CheckoutProductCard";
import type { OrderItem } from "@/features/orders/api/orders.api";
import { resolveCheckoutSizeLabel, findSizeBySkuForProduct } from "@/features/checkout/lib/resolve-checkout-size";

export function matchCartItemForProduct(
  product: Product,
  cartItems: CartItem[],
): CartItem | undefined {
  const slug = productSlugFromSourceUrl(product.sourceUrl);
  const productSkus = new Set(product.sizes?.map((size) => size.sku) ?? []);

  const bySku = cartItems.find((item) => productSkus.has(item.sku));
  if (bySku) return bySku;

  const bySlug = cartItems.find(
    (item) => item.productSlug && item.productSlug === slug,
  );
  if (bySlug) return bySlug;

  const byTitle = cartItems.find((item) => item.name === product.title);
  if (byTitle) return byTitle;

  return cartItems.find((item) => {
    if (productIdFromSku(item.sku) === product._id) return true;
    return Boolean(findSizeBySkuForProduct(product, item.sku));
  });
}

export function buildOrderItemsFromCheckout(
  products: Product[],
  lineStates: CheckoutLineState[],
  cartItems: CartItem[] = [],
): OrderItem[] {
  return products.map((product, index) => {
    const line = lineStates[index];
    const matchedCartItem = matchCartItemForProduct(product, cartItems);
    const sku = matchedCartItem?.sku ?? line.sku;
    const variantLabel = resolveCheckoutSizeLabel(
      product,
      sku,
      matchedCartItem?.variantLabel ?? line.variantLabel,
    );

    return {
      productId: product._id,
      productSlug: productSlugFromSourceUrl(product.sourceUrl),
      sku,
      name: matchedCartItem?.name ?? product.title,
      image: matchedCartItem?.image ?? product.imageUrls[0] ?? "",
      variantLabel,
      size: variantLabel,
      quantity: line.quantity,
      unitPrice: matchedCartItem?.unitPrice ?? product.price,
    };
  });
}
