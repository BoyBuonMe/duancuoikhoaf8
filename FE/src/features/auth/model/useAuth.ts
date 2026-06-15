"use client";

import {
  clearSession,
  setSession,
  setUser,
} from "@/features/auth/model/auth.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { AuthUser } from "@/features/auth/model/auth.types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const sessionChecked = useAppSelector((s) => s.auth.sessionChecked);

  return {
    user,
    sessionChecked,
    isAuthenticated: user !== null,
    setSession: (nextUser: AuthUser, accessToken: string) =>
      dispatch(setSession({ user: nextUser, accessToken })),
    setUser: (nextUser: AuthUser | null) => dispatch(setUser(nextUser)),
    clearSession: () => dispatch(clearSession()),
  };
}
