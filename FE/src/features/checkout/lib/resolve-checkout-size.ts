import type { Product } from "@/features/products/model/product.types";

function sizeLabelFromSku(sku: string): string {
  const suffix = sku.split("-").pop();
  if (!suffix || suffix === sku) return "";

  if (suffix === "ONE") return "One size";

  return suffix.replace(/_/g, " ");
}

function findSizeBySku(product: Product, sku: string) {
  const trimmedSku = sku.trim();
  if (!trimmedSku) return null;

  const direct = product.sizes?.find((size) => size.sku === trimmedSku);
  if (direct) return direct;

  return (
    product.sizes?.find(
      (size) =>
        trimmedSku === `${product._id}-${size.id}` ||
        trimmedSku.endsWith(`-${size.id}`),
    ) ?? null
  );
}

export function findSizeBySkuForProduct(product: Product, sku: string) {
  return findSizeBySku(product, sku);
}

export function resolveCheckoutSizeLabel(
  product: Product,
  sku?: string,
  variantLabel?: string,
): string {
  const trimmedLabel = variantLabel?.trim();
  if (trimmedLabel) return trimmedLabel;

  const trimmedSku = sku?.trim();
  if (!trimmedSku) return "";

  const matchedSize = findSizeBySku(product, trimmedSku);
  if (matchedSize?.label) return matchedSize.label;

  return sizeLabelFromSku(trimmedSku);
}
