"use client";

import { ArrowLeft } from "lucide-react";
import type { Product } from "@/admin/services/products/productsService";

type Props = {
  product: Product;
  onBack: () => void;
  onEdit: (product: Product) => void;
};

function formatPrice(amount: number, currency: string) {
  if (currency === "VND") {
    return "VND " + amount.toLocaleString("vi-VN");
  }
  return amount.toLocaleString("vi-VN") + " " + currency;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

export default function ViewProductPage({ product, onBack, onEdit }: Props) {
  return (
    <div className="space-y-5 animate-page-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950 animate-slide-left"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Chi tiết sản phẩm
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thông tin chi tiết của sản phẩm.
          </p>
        </div>
        <button
          onClick={() => onEdit(product)}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Chỉnh sửa
        </button>
      </div>

      <div className="dashboard-card max-w-4xl p-6 space-y-6 animate-card-in delay-150">
        {/* Images */}
        {product.imageUrls.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-3">
              Ảnh sản phẩm
            </p>
            <div className="flex flex-wrap gap-3">
              {product.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.title} ${index + 1}`}
                  className="h-24 w-24 rounded-xl border border-gray-100 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">
              Tên sản phẩm
            </p>
            <p className="text-slate-900 font-medium">{product.title}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">
              Giá
            </p>
            <p className="text-slate-900 font-medium">
              {formatPrice(product.price.amount, product.price.currency)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">
              Danh mục
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.categories.length > 0 ? (
                product.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <p className="text-slate-400 text-sm">—</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">
              Ngày tạo
            </p>
            <p className="text-slate-900">{formatDate(product.createdAt)}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">
              Cập nhật lần cuối
            </p>
            <p className="text-slate-900">{formatDate(product.updatedAt)}</p>
          </div>

          {product.sourceUrl && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                Source URL
              </p>
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm break-all"
              >
                {product.sourceUrl}
              </a>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">
              Mã sản phẩm
            </p>
            <p className="font-mono text-xs text-slate-400 break-all">
              {product._id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
