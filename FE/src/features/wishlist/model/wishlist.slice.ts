"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { clearSession } from "@/features/auth/model/auth.slice";
import type { WishlistItemResponse } from "@/features/wishlist/api/wishlist.api";
import type { Product } from "@/features/products/model/product.types";

export interface WishlistState {
  productIds: string[];
  items: WishlistItemResponse[];
}

const initialState: WishlistState = {
  productIds: [],
  items: [],
};

function productIdsFromItems(items: WishlistItemResponse[]) {
  return items.map((item) => item.productId);
}

/**
 * Server-synced wishlist for authenticated users. Product ids drive
 * heart toggles; enriched items power the dedicated wishlist page.
 */
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistFromApi(state, action: PayloadAction<WishlistItemResponse[]>) {
      state.items = action.payload;
      state.productIds = productIdsFromItems(action.payload);
    },
    setProductIds(state, action: PayloadAction<string[]>) {
      state.productIds = action.payload;
    },
    addProductId(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.productIds.includes(id)) {
        state.productIds.push(id);
      }
    },
    removeProductId(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.productIds = state.productIds.filter((pid) => pid !== id);
      state.items = state.items.filter((item) => item.productId !== id);
    },
    clear(state) {
      state.productIds = [];
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // Clear wishlist đồng bộ khi logout
    builder.addCase(clearSession, () => initialState);
  },
});

export const {
  setWishlistFromApi,
  setProductIds,
  addProductId,
  removeProductId,
  clear,
} = wishlistSlice.actions;
export const wishlistReducer = wishlistSlice.reducer;

export function selectWishlistHas(
  productIds: string[],
  productId: string,
): boolean {
  return productIds.includes(productId);
}

export type { Product };
