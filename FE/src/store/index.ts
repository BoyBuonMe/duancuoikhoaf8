"use client";

import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import {
  authReducer,
  clearSession,
  setSession,
} from "@/features/auth/model/auth.slice";
import { authApi } from "@/features/auth/api/auth.query.api";
import { cartApi } from "@/features/cart/api/cart.api";
import { ordersApi } from "@/features/orders/api/orders.query.api";
import { productsReducer } from "@/features/products/model/products.slice";
import { wishlistReducer } from "@/features/wishlist/model/wishlist.slice";
import { sessionPersistStorage } from "@/store/persist-storage";

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setSession,
  effect(_action, api) {
    api.dispatch(cartApi.util.resetApiState());
  },
});

listenerMiddleware.startListening({
  actionCreator: clearSession,
  effect(_action, api) {
    api.dispatch(authApi.util.resetApiState());
    api.dispatch(cartApi.util.resetApiState());
    api.dispatch(ordersApi.util.resetApiState());
  },
});

const productsPersistConfig = {
  key: "ecommerce-product-cache",
  version: 1,
  storage: sessionPersistStorage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [ordersApi.reducerPath]: ordersApi.reducer,
  products: persistReducer(productsPersistConfig, productsReducer),
  wishlist: wishlistReducer,
});

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          warnAfter: 128,
        },
        immutableCheck: { warnAfter: 128 },
      })
        .prepend(listenerMiddleware.middleware)
        .concat(authApi.middleware, cartApi.middleware, ordersApi.middleware),
  });
}

export const store = makeStore();
export const persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
