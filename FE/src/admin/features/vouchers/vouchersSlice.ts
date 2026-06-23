import { createSlice } from "@reduxjs/toolkit";
import type { Voucher } from "@/admin/services/vouchers/vouchersService";
import { getVouchers } from "@/admin/services/vouchers/vouchersService";

interface VouchersState {
  vouchers: Voucher[];
  loading: boolean;
  error: string | null;
}

const initialState: VouchersState = {
  vouchers: [],
  loading: false,
  error: null,
};

const vouchersSlice = createSlice({
  name: "vouchers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload.vouchers;
      })
      .addCase(getVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default vouchersSlice.reducer;
export { getVouchers };
