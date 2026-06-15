"use client";

import { useCallback } from "react";
import {
  cacheProduct as cacheProductAction,
  cacheProducts as cacheProductsAction,
  clearProductCache as clearProductCacheAction,
} from "@/features/products/model/products.slice";
import type { Product } from "@/features/products/model/product.types";
import { useAppDispatch } from "@/store/hooks";

export function useProductCache() {
  const dispatch = useAppDispatch();

  const cacheProduct = useCallback(
    (product: Product) => dispatch(cacheProductAction(product)),
    [dispatch],
  );

  const cacheProducts = useCallback(
    (products: Product[]) => dispatch(cacheProductsAction(products)),
    [dispatch],
  );

  const clearProductCache = useCallback(
    () => dispatch(clearProductCacheAction()),
    [dispatch],
  );

  return { cacheProduct, cacheProducts, clearProductCache };
}
