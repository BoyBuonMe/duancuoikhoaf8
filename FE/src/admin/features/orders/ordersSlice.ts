import { createSlice } from "@reduxjs/toolkit";
import type { Order } from "@/admin/services/orders/ordersService";
import { getOrders } from "@/admin/services/orders/ordersService";

interface OrdersState {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  total: 0,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        if ("orders" in action.payload) {
          state.orders = action.payload.orders;
          state.total = action.payload.total ?? action.payload.orders.length;
          return;
        }

        if (Array.isArray(action.payload.data)) {
          state.orders = action.payload.data;
          state.total =
            ("total" in action.payload ? action.payload.total : undefined) ??
            action.payload.data.length;
          return;
        }

        state.orders = action.payload.data.orders;
        state.total =
          action.payload.data.total ?? action.payload.data.orders.length;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default ordersSlice.reducer;
export { getOrders };
