import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { authReducer } from "@/features/auth/model/auth.slice";
import { authApi } from "@/features/auth/api/auth.query.api";
import { cartApi } from "@/features/cart/api/cart.api";
import { ordersApi } from "@/features/orders/api/orders.query.api";
import { productsReducer } from "@/features/products/model/products.slice";
import { wishlistReducer } from "@/features/wishlist/model/wishlist.slice";

const testRootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  products: productsReducer,
  wishlist: wishlistReducer,
});

export type TestRootState = ReturnType<typeof testRootReducer>;

const emptyTestState: Partial<TestRootState> = {
  auth: { user: null, sessionChecked: true },
  products: { bySlug: {} },
  wishlist: { productIds: [], items: [] },
};

export function createTestStore(overrides?: Partial<TestRootState>) {
  return configureStore({
    reducer: testRootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        cartApi.middleware,
        ordersApi.middleware,
      ),
    preloadedState: { ...emptyTestState, ...overrides },
  });
}

export function TestStoreProvider({
  children,
  preloadedState,
}: {
  children: ReactNode;
  preloadedState?: Partial<TestRootState>;
}) {
  const store = createTestStore(preloadedState);
  return <Provider store={store}>{children}</Provider>;
}
