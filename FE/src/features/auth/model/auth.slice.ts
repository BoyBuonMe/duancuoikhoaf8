"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { writeAccessToken } from "@/utils/http";
import type { AuthUser } from "@/features/auth/model/auth.types";

export interface AuthState {
  user: AuthUser | null;
  sessionChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  sessionChecked: false,
};

/**
 * Auth slice keeps the current user in memory while the access token
 * lives in localStorage (set/read through the shared http client).
 * The refresh token is an httpOnly cookie managed by the BE.
 *
 * Intentionally NOT persisted: rehydration of the user happens by
 * calling /users/me after the http client resolves the access token.
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string }>,
    ) {
      writeAccessToken(action.payload.accessToken);
      state.user = action.payload.user;
      state.sessionChecked = true;
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.sessionChecked = true;
    },
    setSessionChecked(state, action: PayloadAction<boolean>) {
      state.sessionChecked = action.payload;
    },
    clearSession(state) {
      writeAccessToken(null);
      state.user = null;
      state.sessionChecked = true;
    },
  },
});

export const { setSession, setUser, setSessionChecked, clearSession } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
