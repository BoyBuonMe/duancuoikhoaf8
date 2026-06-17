import { createSlice } from "@reduxjs/toolkit";
import type { AdminUser } from "@/admin/services/admin/adminUsersService";
import { getUsers } from "@/admin/services/admin/adminUsersService";

export { getUsers };

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUsersState {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: AdminUsersState = {
  users: [],
  loading: false,
  error: null,
};

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
