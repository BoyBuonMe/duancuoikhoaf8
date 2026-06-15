"use client";

import { useEffect } from "react";
import { meApi } from "@/features/auth/api/auth.api";
import { clearSession, setUser } from "@/features/auth/model/auth.slice";
import { useAppDispatch } from "@/store/hooks";

export function AuthSessionBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    meApi()
      .then((user) => {
        if (!cancelled) dispatch(setUser(user));
      })
      .catch(() => {
        if (!cancelled) dispatch(clearSession());
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
