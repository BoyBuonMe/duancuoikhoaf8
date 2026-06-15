"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchProductBySlug } from "@/features/products/api/products.api";
import type { Product } from "@/features/products/model/product.types";
import { cacheProduct as cacheProductAction } from "@/features/products/model/products.slice";
import { parseCheckoutSlugs } from "@/features/checkout/lib/parse-checkout-slugs";
import { store } from "@/store";

function hasCompleteCheckoutSizes(product: Product): boolean {
  return Boolean(product.sizes?.some((size) => size.sku?.trim() && size.label?.trim()));
}

interface CheckoutProductsState {
  products: Product[];
  failedSlugs: string[];
  resolvedKey: string;
}

const EMPTY_STATE: CheckoutProductsState = {
  products: [],
  failedSlugs: [],
  resolvedKey: "",
};

export function useCheckoutProducts(slugParam?: string) {
  const slugs = useMemo(() => parseCheckoutSlugs(slugParam), [slugParam]);
  const slugKey = slugs.join("&");
  const hasSlugs = slugs.length > 0;
  const [data, setData] = useState<CheckoutProductsState>(EMPTY_STATE);

  useEffect(() => {
    if (!slugKey) return;

    let cancelled = false;

    void (async () => {
      const loaded: Product[] = [];
      const missing: string[] = [];
      const cachedBySlug = store.getState().products.bySlug;

      for (const slug of slugs) {
        const cached = cachedBySlug[slug];

        try {
          const { product } = await fetchProductBySlug(slug);
          store.dispatch(cacheProductAction(product));
          loaded.push(product);
        } catch {
          if (cached && hasCompleteCheckoutSizes(cached)) {
            loaded.push(cached);
            continue;
          }
          if (cached) {
            loaded.push(cached);
            continue;
          }
          missing.push(slug);
        }
      }

      if (cancelled) return;
      setData({
        products: loaded,
        failedSlugs: missing,
        resolvedKey: slugKey,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [slugKey, slugs]);

  const isResolved = data.resolvedKey === slugKey;
  const loading = hasSlugs && !isResolved;
  const products = hasSlugs && isResolved ? data.products : [];
  const failedSlugs = hasSlugs && isResolved ? data.failedSlugs : [];

  return {
    slugs,
    products,
    loading,
    failedSlugs,
    isReady:
      hasSlugs && isResolved && products.length === slugs.length,
  };
}
