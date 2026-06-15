"use client";

import { usePathname } from "next/navigation";
import { CATALOG_ROOTS } from "@/features/products/lib/category-path";
import { ProductDetailSkeleton } from "@/components/skeletons/ProductDetailSkeleton";
import { ProductListSkeleton } from "@/components/skeletons/ProductListSkeleton";

export function ProductsRouteSkeleton() {
  const pathname = usePathname();
  const segments = pathname
    .replace(/^\/products\/?/, "")
    .split("/")
    .filter(Boolean);

  const isProductDetail =
    segments.length === 1 && !CATALOG_ROOTS.has(segments[0]);

  if (isProductDetail) {
    return <ProductDetailSkeleton />;
  }

  return <ProductListSkeleton />;
}
