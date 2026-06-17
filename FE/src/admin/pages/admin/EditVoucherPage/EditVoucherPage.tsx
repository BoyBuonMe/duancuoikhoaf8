"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/admin/hooks/hooks";
import { getVouchers } from "@/admin/features/vouchers/vouchersSlice";
import {
  getVoucherError,
  updateVoucher,
  type Voucher,
  type VoucherPayload,
} from "@/admin/services/vouchers/vouchersService";
import { voucherFormSchema, type VoucherFormValues } from "@/admin/utils/validate";

type Props = {
  voucher: Voucher;
  onBack: () => void;
};

function splitValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPayload(values: VoucherFormValues): VoucherPayload {
  return {
    code: values.code.trim().toUpperCase(),
    label: values.label.trim(),
    discountType: "percent",
    discountValue: Number(values.discountValue),
    conditions: {
      minSubtotal: Number(values.minSubtotal),
      categoryKeywords: splitValues(values.categoryKeywords),
      titleKeywords: splitValues(values.titleKeywords),
    },
    productSourceUrls: splitValues(values.productSourceUrls),
    expiresAt: values.expiresAt,
    isActive: values.isActive === "active",
  };
}

function toDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function EditVoucherPage({ voucher, onBack }: Props) {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema()),
    defaultValues: {
      code: voucher.code,
      label: voucher.label,
      discountValue: String(voucher.value),
      minSubtotal: String(voucher.conditions.minSubtotal),
      categoryKeywords: voucher.conditions.categoryKeywords.join(", "),
      titleKeywords: voucher.conditions.titleKeywords.join(", "),
      productSourceUrls: voucher.productSourceUrls.join(", "),
      expiresAt: toDateInput(voucher.endDate),
      isActive: voucher.status === "active" ? "active" : "inactive",
    },
  });

  async function onSubmit(values: VoucherFormValues) {
    try {
      await updateVoucher(voucher._id, buildPayload(values));
      await dispatch(getVouchers()).unwrap();
      onBack();
    } catch (error) {
      setError("root", {
        message: getVoucherError(error, "Không thể cập nhật voucher"),
      });
    }
  }

  return (
    <div className="space-y-5 animate-page-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 animate-slide-left"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <div className="animate-fade-up delay-75">
        <h1 className="text-2xl font-bold text-slate-950">Sửa voucher</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cập nhật điều kiện giảm giá.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="dashboard-card max-w-4xl p-6 animate-card-in delay-150"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Mã voucher" error={errors.code?.message}>
            <input
              {...register("code")}
              className="form-input uppercase"
              placeholder="FORMCRUD25"
            />
          </Field>

          <Field label="Tên voucher" error={errors.label?.message}>
            <input
              {...register("label")}
              className="form-input"
              placeholder="Form payload voucher"
            />
          </Field>

          <Field label="Phần trăm giam" error={errors.discountValue?.message}>
            <input
              {...register("discountValue")}
              className="form-input"
              inputMode="decimal"
              placeholder="25"
            />
          </Field>

          <Field label="Đơn tối thiểu" error={errors.minSubtotal?.message}>
            <input
              {...register("minSubtotal")}
              className="form-input"
              inputMode="decimal"
              placeholder="50"
            />
          </Field>

          <Field
            label="Từ khóa danh mục"
            error={errors.categoryKeywords?.message}
          >
            <input
              {...register("categoryKeywords")}
              className="form-input"
              placeholder="shorts, tanks"
            />
          </Field>

          <Field label="Từ khóa tên sản phẩm" error={errors.titleKeywords?.message}>
            <input
              {...register("titleKeywords")}
              className="form-input"
              placeholder="arrival, mesh"
            />
          </Field>

          <Field
            label="Product source URLs"
            error={errors.productSourceUrls?.message}
          >
            <textarea
              {...register("productSourceUrls")}
              className="form-input min-h-24 resize-y"
              placeholder="https://example.com/product-a, https://example.com/product-b"
            />
          </Field>

          <Field label="Ngày hết hạn" error={errors.expiresAt?.message}>
            <input
              {...register("expiresAt")}
              className="form-input"
              type="date"
            />
          </Field>

          <Field label="Trạng thái" error={errors.isActive?.message}>
            <select {...register("isActive")} className="form-input">
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm tắt</option>
            </select>
          </Field>
        </div>

        {errors.root && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.root.message}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
