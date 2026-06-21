"use client";

import { useEffect } from "react";
import { useLazyGetMeQuery } from "@/features/auth/api/auth.query.api";
import {
  setGuestSession,
  setUser,
} from "@/features/auth/model/auth.slice";
import { useHasHydrated } from "@/shared/hooks/useHasHydrated";
import { useAppDispatch } from "@/store/hooks";
import {
  hasAuthSessionHint,
  readAccessToken,
  refreshAccessToken,
} from "@/utils/http";

/** Resolve the memory access token first, then sync /users/me into auth state. */
export function AuthQuerySync() {
  const dispatch = useAppDispatch();
  const hasHydrated = useHasHydrated();
  const [getMe] = useLazyGetMeQuery();

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;

    async function syncSession() {
      const token =
        readAccessToken() ??
        (hasAuthSessionHint() ? await refreshAccessToken() : null);

      if (cancelled) return;

      if (!token) {
        dispatch(setGuestSession());
        return;
      }

      try {
        const user = await getMe(undefined, true).unwrap();
        if (!cancelled) dispatch(setUser(user));
      } catch {
        if (!cancelled) dispatch(setGuestSession());
      }
    }

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, dispatch, getMe]);

  return null;
}
