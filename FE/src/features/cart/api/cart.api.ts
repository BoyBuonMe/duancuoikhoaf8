import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/utils/axiosBaseQuery";
import type { CartItem } from "@/features/cart/model/cart.types";
import type { Money } from "@/shared/types";

export interface BECart {
  userEmail: string;
  items: CartItem[];
  subtotal: Money;
  updatedAt: string;
}

export type AddItemPayload = {
  sku: string;
  quantity: number;
  name: string;
  image: string;
  variantLabel?: string;
  productSlug?: string;
};

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query<BECart, void>({
      query: () => ({ url: "/cart", method: "GET" }),
      providesTags: ["Cart"],
    }),

    addItem: builder.mutation<BECart, AddItemPayload>({
      query: (body) => ({ url: "/cart/items", method: "POST", data: body }),
      invalidatesTags: ["Cart"],
    }),

    updateItem: builder.mutation<BECart, { sku: string; quantity: number }>({
      query: ({ sku, quantity }) => ({
        url: `/cart/items/${encodeURIComponent(sku)}`,
        method: "PATCH",
        data: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    removeItem: builder.mutation<BECart, string>({
      query: (sku) => ({
        url: `/cart/items/${encodeURIComponent(sku)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<null, void>({
      query: () => ({ url: "/cart", method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddItemMutation,
  useUpdateItemMutation,
  useRemoveItemMutation,
  useClearCartMutation,
} = cartApi;
