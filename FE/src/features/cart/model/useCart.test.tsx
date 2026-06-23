import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

import { useCart } from "@/features/cart/model/useCart";
import { TestStoreProvider } from "@/test-utils/store";
import { ToastProvider } from "@/shared/context/ToastContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TestStoreProvider
      preloadedState={{
        wishlist: { productIds: [], items: [] },
        auth: { user: null, sessionChecked: true },
      }}
    >
      <ToastProvider>{children}</ToastProvider>
    </TestStoreProvider>
  );
}

describe("useCart", () => {
  it("returns an empty snapshot while unauthenticated", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toEqual({ amount: 0, currency: "USD" });
  });
});
