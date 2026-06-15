"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { AuthQuerySync } from "@/features/auth/model/AuthQuerySync";
import { WishlistBootstrap } from "@/features/wishlist/model/WishlistBootstrap";
import { WishlistLoginPromptProvider } from "@/features/wishlist/model/WishlistLoginPrompt";
import { store } from "@/store";

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <WishlistLoginPromptProvider>
        <AuthQuerySync />
        <WishlistBootstrap />
        {children}
      </WishlistLoginPromptProvider>
    </Provider>
  );
}
