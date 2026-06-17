"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/admin/hooks/hooks";
import {
  createProduct,
  getProducts,
} from "@/admin/services/products/productsService";
import type { ProductPayload } from "@/admin/services/products/productsService";
import { productFormSchema } from "@/admin/utils/validate";
import type { ProductFormValues } from "@/admin/utils/validate";

type Props = {
  onBack: () => void;
};

function splitValues(str: string): string[] {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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

export default function AddProductPage({ onBack }: Props) {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema()),
    defaultValues: {
      title: "",
      amount: "",
      currency: "USD",
      categories: "",
      imageUrls: "",
      sourceUrl: "",
    },
  });

  async function onSubmit(data: ProductFormValues) {
    const payload: ProductPayload = {
      title: data.title,
      price: { amount: Number(data.amount), currency: data.currency },
      categories: splitValues(data.categories),
      imageUrls: splitValues(data.imageUrls),
      sourceUrl: data.sourceUrl.trim() || undefined,
    };

    try {
      await dispatch(createProduct(payload)).unwrap();
      await dispatch(getProducts({ limit: 100 })).unwrap();
      onBack();
    } catch (err) {
      setError("root", {
        message: typeof err === "string" ? err : "Lưu sản phẩm thất bại",
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
        <h1 className="text-2xl font-bold text-slate-950">Thêm sản phẩm</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thêm sản phẩm mới vào hệ thống.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="dashboard-card max-w-4xl p-6 animate-card-in delay-150"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tên sản phẩm" error={errors.title?.message}>
            <input
              {...register("title")}
              className="form-input"
              placeholder="Arrival T-Shirt"
            />
          </Field>

          <Field label="Giá" error={errors.amount?.message}>
            <input
              {...register("amount")}
              className="form-input"
              inputMode="decimal"
              placeholder="32"
            />
          </Field>

          <Field label="Tiền tệ" error={errors.currency?.message}>
            <input
              {...register("currency")}
              className="form-input"
              placeholder="USD"
            />
          </Field>

          <Field
            label="Danh mục (cách nhau bằng dấu phẩy)"
            error={errors.categories?.message}
          >
            <input
              {...register("categories")}
              className="form-input"
              placeholder="Mens, Apparel"
            />
          </Field>

          <Field
            label="Ảnh sản phẩm (cách nhau bằng dấu phẩy)"
            error={errors.imageUrls?.message}
          >
            <input
              {...register("imageUrls")}
              className="form-input"
              placeholder="https://..."
            />
          </Field>

          <Field label="Source URL" error={errors.sourceUrl?.message}>
            <input
              {...register("sourceUrl")}
              className="form-input"
              placeholder="https://..."
            />
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
            {isSubmitting ? "Đang lưu..." : "Thêm sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
