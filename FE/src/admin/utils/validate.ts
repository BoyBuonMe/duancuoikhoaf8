import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { z } from "zod";

export const USER_ROLE_OPTIONS = ["boss", "admin", "user"] as const;
export const USER_STATUS_OPTIONS = ["active", "blocked"] as const;
export const VOUCHER_TYPE_OPTIONS = ["percent", "fixed"] as const;
export const VOUCHER_STATUS_OPTIONS = ["active", "inactive"] as const;

export function userFormSchema() {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, "Ho ten phai co it nhat 2 ky tu")
      .max(80, "Ho ten khong duoc qua 80 ky tu"),
    phone: z
      .string()
      .trim()
      .refine(
        (value) => !value || /^[0-9+\-\s()]{8,20}$/.test(value),
        "Số điện thoại khong hop le",
      ),
    role: z.enum(USER_ROLE_OPTIONS, {
      message: "Vui long chon vai tro hop le",
    }),
    status: z.enum(USER_STATUS_OPTIONS, {
      message: "Vui long chon trang thai hop le",
    }),
  });
}

export type UserFormValues = z.input<ReturnType<typeof userFormSchema>>;

export function productFormSchema() {
  return z.object({
    title: z.string().trim().min(1, "Tên sản phẩm không được để trống"),
    amount: z
      .string()
      .min(1, "Giá không được để trống")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        "Giá phải là số không âm",
      ),
    currency: z.string().trim().min(1, "Tiền tệ không được để trống"),
    categories: z.string(),
    imageUrls: z.string(),
    sourceUrl: z
      .string()
      .refine(
        (val) =>
          !val.trim() ||
          /^https?:\/\/.+/.test(val.trim()) ||
          /^\/products\/[A-Za-z0-9][A-Za-z0-9-]*$/.test(val.trim()),
        "Source URL không hợp lệ (phải bắt đầu bằng http:// hoặc https://)",
      ),
  });
}

export type ProductFormValues = z.infer<ReturnType<typeof productFormSchema>>;
export type UserFormPayload = z.output<ReturnType<typeof userFormSchema>>;

export function voucherFormSchema() {
  return z.object({
    code: z
      .string()
      .trim()
      .min(2, "Mã voucher phai co it nhat 2 ky tu")
      .max(60, "Mã voucher khong duoc qua 60 ky tu"),
    label: z
      .string()
      .trim()
      .min(2, "Tên voucher phai co it nhat 2 ky tu")
      .max(120, "Tên voucher khong duoc qua 120 ky tu"),
    discountValue: z
      .string()
      .trim()
      .min(1, "Giá trị giam khong duoc de trong")
      .refine(
        (value) =>
          Number.isFinite(Number(value)) &&
          Number(value) > 0 &&
          Number(value) <= 100,
        "Giá trị giam phai tu 1 den 100",
      ),
    minSubtotal: z
      .string()
      .trim()
      .min(1, "Đơn tối thiểu khong duoc de trong")
      .refine(
        (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
        "Đơn tối thiểu khong hop le",
      ),
    categoryKeywords: z.string(),
    titleKeywords: z.string(),
    productSourceUrls: z.string(),
    expiresAt: z.string().min(1, "Ngày hết hạn khong duoc de trong"),
    isActive: z.enum(["active", "inactive"], {
      message: "Vui long chon trang thai hop le",
    }),
  });
}

export type VoucherFormValues = z.infer<ReturnType<typeof voucherFormSchema>>;

export function createZodResolver<TValues extends FieldValues>(
  schema: z.ZodType<TValues>,
): Resolver<TValues> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors: FieldErrors<TValues> = {};

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0];
      if (typeof fieldName !== "string") continue;

      errors[fieldName as keyof TValues] = {
        type: issue.code,
        message: issue.message,
      } as FieldErrors<TValues>[keyof TValues];
    }

    return {
      values: {},
      errors,
    };
  };
}
