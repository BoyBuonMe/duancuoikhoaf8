"use client";

import { useMemo } from "react";
import { productSlugFromSourceUrl } from "@/features/products/lib/product-slug";
import type { Product } from "@/features/products/model/product.types";
import { useWishlist } from "@/features/wishlist/model/useWishlist";

export interface ResolvedWishlistItem {
  key: string;
  slug: string;
  product: Product | null;
}

export function useResolvedWishlistItems(): ResolvedWishlistItem[] {
  const { items } = useWishlist();

  return useMemo(() => {
    return items.map((item) => {
      const product = item.product;
      const slug = product
        ? productSlugFromSourceUrl(product.sourceUrl)
        : item.productId;

      return {
        key: item.productId,
        slug,
        product,
      };
    });
  }, [items]);
}
