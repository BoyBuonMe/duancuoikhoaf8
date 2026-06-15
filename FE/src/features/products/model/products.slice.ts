"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { productSlugFromSourceUrl } from "@/features/products/lib/product-slug";
import type { Product } from "@/features/products/model/product.types";

export interface ProductsState {
  bySlug: Record<string, Product>;
}

const initialState: ProductsState = {
  bySlug: {},
};

/**
 * Client-side product cache keyed by URL slug. Populated from the
 * product list so detail pages can render without a separate fetch.
 */
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    cacheProduct(state, action: PayloadAction<Product>) {
      const slug = productSlugFromSourceUrl(action.payload.sourceUrl);
      state.bySlug[slug] = action.payload;
    },
    cacheProducts(state, action: PayloadAction<Product[]>) {
      for (const product of action.payload) {
        const slug = productSlugFromSourceUrl(product.sourceUrl);
        state.bySlug[slug] = product;
      }
    },
    clearProductCache(state) {
      state.bySlug = {};
    },
  },
});

export const { cacheProduct, cacheProducts, clearProductCache } =
  productsSlice.actions;
export const productsReducer = productsSlice.reducer;

export function selectCachedProduct(
  state: Pick<ProductsState, "bySlug">,
  slug: string,
): Product | null {
  return state.bySlug[slug] ?? null;
}
