"use client";

import { useEffect } from "react";
import { getWishlistApi } from "@/features/wishlist/api/wishlist.api";
import {
  clear,
  setWishlistFromApi,
} from "@/features/wishlist/model/wishlist.slice";
import { useAuth } from "@/features/auth/model/useAuth";
import { useAppDispatch } from "@/store/hooks";

export function WishlistBootstrap() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, sessionChecked } = useAuth();

  useEffect(() => {
    if (!sessionChecked) return;

    if (!isAuthenticated) {
      dispatch(clear());
      return;
    }

    let cancelled = false;

    getWishlistApi()
      .then((data) => {
        if (!cancelled) dispatch(setWishlistFromApi(data.items));
      })
      .catch(() => {
        if (!cancelled) dispatch(clear());
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, sessionChecked]);

  return null;
}
