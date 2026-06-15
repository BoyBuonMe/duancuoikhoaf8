import type { AppDispatch } from "@/store";
import { cartApi } from "@/features/cart/api/cart.api";

export function syncCartAfterOrder(dispatch: AppDispatch): void {
  dispatch(cartApi.util.invalidateTags(["Cart"]));
  void dispatch(cartApi.endpoints.getCart.initiate(undefined, { forceRefetch: true }));
}
