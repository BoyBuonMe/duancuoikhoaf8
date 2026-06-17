import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import http from "@/admin/utils/http";

const VOUCHERS_ENDPOINT = "/admin/vouchers";

export type VoucherType = "percent" | "fixed";
export type VoucherStatus = "active" | "inactive";

export interface Voucher {
  _id: string;
  code: string;
  label: string;
  type: VoucherType;
  value: number;
  minOrderValue: number;
  conditions: {
    minSubtotal: number;
    categoryKeywords: string[];
    titleKeywords: string[];
  };
  productSourceUrls: string[];
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  status: VoucherStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface VoucherPayload {
  code: string;
  label: string;
  discountType: "percent";
  discountValue: number;
  conditions: {
    minSubtotal: number;
    categoryKeywords: string[];
    titleKeywords: string[];
  };
  productSourceUrls: string[];
  expiresAt: string;
  isActive: boolean;
}

type VouchersResponse =
  | { vouchers: Voucher[] }
  | { data: Voucher[] }
  | { data: { vouchers: Voucher[] } };

type RawVoucher = Partial<Voucher> & {
  id?: string;
  label?: string;
  discountType?: VoucherType | "percentage" | "fixed_amount";
  discountValue?: number;
  discount?: number;
  amount?: number;
  minOrderAmount?: number;
  minimumOrderValue?: number;
  conditions?: Partial<Voucher["conditions"]>;
  productSourceUrls?: string[];
  maxDiscountAmount?: number;
  limit?: number;
  usageCount?: number;
  startAt?: string;
  endAt?: string;
  expiresAt?: string;
  isActive?: boolean;
};

export const getVouchers = createAsyncThunk(
  "vouchers/getVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await http.get<VouchersResponse>(VOUCHERS_ENDPOINT);
      return {
        vouchers: normalizeVouchers(response),
      };
    } catch (error: unknown) {
      return rejectWithValue(getVoucherError(error, "Loi tai danh sach voucher"));
    }
  },
);

export async function createVoucher(payload: VoucherPayload) {
  return http.post<{ voucher: Voucher }>(VOUCHERS_ENDPOINT, payload);
}

export async function updateVoucher(id: string, payload: VoucherPayload) {
  return http.patch<{ voucher: Voucher }>(`${VOUCHERS_ENDPOINT}/${id}`, payload);
}

export async function deleteVoucher(id: string) {
  return http.del(`${VOUCHERS_ENDPOINT}/${id}`);
}

function normalizeVouchers(response: VouchersResponse) {
  const vouchers = "vouchers" in response
    ? response.vouchers
    : Array.isArray(response.data)
      ? response.data
      : response.data.vouchers;

  return vouchers.map(normalizeVoucher);
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeVoucher(voucher: RawVoucher): Voucher {
  const rawType = voucher.type ?? voucher.discountType ?? "fixed";
  const type = rawType === "percentage" ? "percent" : rawType === "fixed_amount" ? "fixed" : rawType;
  const status =
    voucher.status ?? (voucher.isActive === false ? "inactive" : "active");

  return {
    _id: voucher._id ?? voucher.id ?? "",
    code: voucher.code ?? voucher._id ?? voucher.id ?? "",
    label: voucher.label ?? "",
    type: type === "fixed" ? "fixed" : "percent",
    value: toNumber(
      voucher.value ??
        voucher.discountValue ??
        voucher.discount ??
        voucher.amount,
    ),
    minOrderValue: toNumber(
      voucher.minOrderValue ??
        voucher.conditions?.minSubtotal ??
        voucher.minOrderAmount ??
        voucher.minimumOrderValue,
    ),
    conditions: {
      minSubtotal: toNumber(
        voucher.conditions?.minSubtotal ??
          voucher.minOrderValue ??
          voucher.minOrderAmount ??
          voucher.minimumOrderValue,
      ),
      categoryKeywords: voucher.conditions?.categoryKeywords ?? [],
      titleKeywords: voucher.conditions?.titleKeywords ?? [],
    },
    productSourceUrls: voucher.productSourceUrls ?? [],
    maxDiscount:
      voucher.maxDiscount === undefined && voucher.maxDiscountAmount === undefined
        ? undefined
        : toNumber(voucher.maxDiscount ?? voucher.maxDiscountAmount),
    usageLimit:
      voucher.usageLimit === undefined && voucher.limit === undefined
        ? undefined
        : toNumber(voucher.usageLimit ?? voucher.limit),
    usedCount: toNumber(voucher.usedCount ?? voucher.usageCount),
    startDate: voucher.startDate ?? voucher.startAt,
    endDate: voucher.endDate ?? voucher.endAt ?? voucher.expiresAt,
    status: status === "inactive" ? "inactive" : "active",
    createdAt: voucher.createdAt,
    updatedAt: voucher.updatedAt,
  };
}

export function getVoucherError(error: unknown, fallback: string) {
  type ErrorBody = {
    message?: string;
    error?: string;
    errors?: Array<{ message?: string }> | string[];
  };

  const responseMessage =
    axios.isAxiosError<ErrorBody>(error)
      ? error.response?.data?.message ??
        error.response?.data?.error ??
        error.response?.data?.errors
          ?.map((item) => (typeof item === "string" ? item : item.message))
          .filter(Boolean)
          .join(", ")
      : undefined;

  return responseMessage ?? (error instanceof Error ? error.message : fallback);
}
