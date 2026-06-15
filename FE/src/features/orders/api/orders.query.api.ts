import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  CreateOrderPayload,
  Order,
} from "@/features/orders/api/orders.api";
import { axiosBaseQuery } from "@/utils/axiosBaseQuery";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    listOrders: builder.query<Order[], void>({
      query: () => ({ url: "/orders", method: "GET" }),
      transformResponse: (response: { orders: Order[] }) => response.orders,
      providesTags: (result) =>
        result
          ? [
              ...result.map((order) => ({
                type: "Orders" as const,
                id: order._id,
              })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getOrder: builder.query<Order, string>({
      query: (orderCode) => ({
        url: `/orders/${encodeURIComponent(orderCode)}`,
        method: "GET",
      }),
      transformResponse: (response: { order: Order }) => response.order,
      providesTags: (_result, _error, orderCode) => [
        { type: "Orders", id: orderCode },
      ],
    }),

    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({ url: "/orders", method: "POST", data: body }),
      transformResponse: (response: { order: Order }) => response.order,
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),
  }),
});

export const {
  useListOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
} = ordersApi;
