"use client";

import { useEffect } from "react";
import { useGetMeQuery } from "@/features/auth/api/auth.query.api";
import {
  clearSession,
  setSessionChecked,
  setUser,
} from "@/features/auth/model/auth.slice";
import { useHasHydrated } from "@/shared/hooks/useHasHydrated";
import { useAppDispatch } from "@/store/hooks";

/** Sync RTK Query /users/me into the auth slice after client hydration. */
export function AuthQuerySync() {
  const dispatch = useAppDispatch();
  const hasHydrated = useHasHydrated();
  const { data, isError, isSuccess, isFetching } = useGetMeQuery(undefined, {
    skip: !hasHydrated,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!hasHydrated || isFetching) return;

    if (isSuccess && data) {
      dispatch(setUser(data));
      return;
    }

    if (isError) {
      dispatch(clearSession());
      return;
    }

    if (isSuccess && !data) {
      dispatch(setSessionChecked(true));
    }
  }, [hasHydrated, isFetching, isSuccess, isError, data, dispatch]);

  return null;
}
