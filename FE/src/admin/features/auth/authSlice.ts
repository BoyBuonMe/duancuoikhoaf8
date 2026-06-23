import { createSlice } from "@reduxjs/toolkit";
import { authLogin, getCurrentUser } from "@/admin/services/auth/authService";
import type { AuthUser } from "@/admin/services/auth/authService";
import { writeAccessToken } from "@/utils/http";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      writeAccessToken(null);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(authLogin.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ?? "Email hoặc mật khẩu không đúng";
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error =
          action.payload?.message ?? "Không lấy được thông tin tài khoản";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
