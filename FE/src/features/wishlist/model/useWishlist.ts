"use client";

import { useCallback } from "react";
import {
  clearWishlistApi,
  getWishlistApi,
  removeWishlistItemApi,
  toggleWishlistItemApi,
} from "@/features/wishlist/api/wishlist.api";
import { useAuth } from "@/features/auth/model/useAuth";
import { useWishlistLoginPrompt } from "@/features/wishlist/model/WishlistLoginPrompt";
import { useToast } from "@/shared/context/ToastContext";
import {
  addProductId,
  clear,
  removeProductId,
  setWishlistFromApi,
} from "@/features/wishlist/model/wishlist.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useWishlist() {
  const dispatch = useAppDispatch();
  const productIds = useAppSelector((s) => s.wishlist.productIds);
  const items = useAppSelector((s) => s.wishlist.items);
  const { isAuthenticated } = useAuth();
  const { openLoginPrompt } = useWishlistLoginPrompt();
  const toast = useToast();

  const toggle = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        openLoginPrompt();
        return;
      }

      const wasWishlisted = productIds.includes(productId);
      if (wasWishlisted) {
        dispatch(removeProductId(productId));
      } else {
        dispatch(addProductId(productId));
      }

      try {
        const data = await toggleWishlistItemApi(productId);
        dispatch(setWishlistFromApi(data.items));
        toast.success(
          wasWishlisted ? "Removed from Wishlist" : "Added to Wishlist"
        );
      } catch {
        if (wasWishlisted) {
          dispatch(addProductId(productId));
        } else {
          dispatch(removeProductId(productId));
        }
        toast.error("Failed to update Wishlist.");
      }
    },
    [dispatch, isAuthenticated, openLoginPrompt, productIds, toast],
  );

  const remove = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;

      dispatch(removeProductId(productId));
      try {
        const data = await removeWishlistItemApi(productId);
        dispatch(setWishlistFromApi(data.items));
        toast.success("Removed from Wishlist");
      } catch {
        const data = await getWishlistApi().catch(() => null);
        if (data) dispatch(setWishlistFromApi(data.items));
        toast.error("Failed to remove from Wishlist.");
      }
    },
    [dispatch, isAuthenticated, toast],
  );

  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) return;

    dispatch(clear());
    try {
      await clearWishlistApi();
      toast.success("Wishlist cleared.");
    } catch {
      toast.error("Failed to clear wishlist.");
    }
  }, [dispatch, isAuthenticated, toast]);

  return {
    productIds,
    items,
    count: productIds.length,
    isWishlisted: (productId: string) => productIds.includes(productId),
    toggle,
    remove,
    clear: clearWishlist,
  };
}
