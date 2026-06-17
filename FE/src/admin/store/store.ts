import { configureStore } from "@reduxjs/toolkit";
import adminUsersReducer from "@/admin/features/admin/adminUsersSlice";
import authReducer from "@/admin/features/auth/authSlice";
import ordersReducer from "@/admin/features/orders/ordersSlice";
import productsReducer from "@/admin/features/products/productsSlice";
import vouchersReducer from "@/admin/features/vouchers/vouchersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminUsers: adminUsersReducer,
    orders: ordersReducer,
    products: productsReducer,
    vouchers: vouchersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
