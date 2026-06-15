"use client";

import { useEffect, useState } from "react";
import {
  searchProductsApi,
  type Product,
  type ProductListResponse,
} from "@/features/products";

interface SearchData {
  products: Product[];
  error: string | null;
  resolvedQuery: string;
}

const EMPTY_SEARCH: SearchData = {
  products: [],
  error: null,
  resolvedQuery: "",
};

export function useProductSearch(trimmedQuery: string) {
  const [data, setData] = useState<SearchData>(EMPTY_SEARCH);

  useEffect(() => {
    if (!trimmedQuery) return;

    const controller = new AbortController();

    searchProductsApi(trimmedQuery, {
      limit: 8,
      signal: controller.signal,
    })
      .then((response: ProductListResponse) => {
        if (controller.signal.aborted) return;
        setData({
          products: response.products,
          error: null,
          resolvedQuery: trimmedQuery,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setData({
          products: [],
          error: "Could not load search results.",
          resolvedQuery: trimmedQuery,
        });
        console.error(err);
      });

    return () => controller.abort();
  }, [trimmedQuery]);

  const isResolved = data.resolvedQuery === trimmedQuery;
  const loading = trimmedQuery.length > 0 && !isResolved;
  const results = trimmedQuery.length > 0 && isResolved ? data.products : [];
  const error = trimmedQuery.length > 0 && isResolved ? data.error : null;

  return { results, loading, error };
}
