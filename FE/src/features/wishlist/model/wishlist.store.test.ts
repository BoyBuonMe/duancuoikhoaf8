import { describe, expect, it } from "vitest";

import {
  addProductId,
  clear,
  removeProductId,
  selectWishlistHas,
} from "@/features/wishlist/model/wishlist.slice";
import { createTestStore } from "@/test-utils/store";

function wishlistProductIds(store: ReturnType<typeof createTestStore>) {
  return store.getState().wishlist.productIds;
}

describe("wishlist slice product ids", () => {
  it("adds a product id when absent", () => {
    const store = createTestStore();
    store.dispatch(addProductId("product-1"));
    expect(wishlistProductIds(store)).toEqual(["product-1"]);
  });

  it("add is idempotent", () => {
    const store = createTestStore();
    store.dispatch(addProductId("product-1"));
    store.dispatch(addProductId("product-1"));
    expect(wishlistProductIds(store)).toEqual(["product-1"]);
  });

  it("remove drops one product id", () => {
    const store = createTestStore({
      wishlist: { productIds: ["a", "b", "c"], items: [] },
      auth: { user: null, sessionChecked: true },
    });
    store.dispatch(removeProductId("b"));
    expect(wishlistProductIds(store)).toEqual(["a", "c"]);
  });
});

describe("wishlist slice has and clear", () => {
  it("selectWishlistHas reflects membership", () => {
    const store = createTestStore({
      wishlist: { productIds: ["a"], items: [] },
      auth: { user: null, sessionChecked: true },
    });
    const productIds = wishlistProductIds(store);
    expect(selectWishlistHas(productIds, "a")).toBe(true);
    expect(selectWishlistHas(productIds, "b")).toBe(false);
  });

  it("clear empties the list", () => {
    const store = createTestStore({
      wishlist: { productIds: ["a", "b"], items: [] },
      auth: { user: null, sessionChecked: true },
    });
    store.dispatch(clear());
    expect(wishlistProductIds(store)).toEqual([]);
  });
});
