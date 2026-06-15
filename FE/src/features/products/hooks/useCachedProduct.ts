"use client";

import { selectCachedProduct } from "@/features/products/model/products.slice";
import { useAppSelector } from "@/store/hooks";

export function useCachedProduct(slug: string) {
  return useAppSelector((state) =>
    selectCachedProduct(state.products, slug),
  );
}
