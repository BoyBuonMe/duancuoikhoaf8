"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/admin/hooks/hooks";
import usePagination from "@/admin/hooks/usePagination";
import { getProducts } from "@/admin/features/products/productsSlice";
import { deleteProduct } from "@/admin/services/products/productsService";
import type { Product } from "@/admin/services/products/productsService";
import AddProductPage from "../AddProductPage/AddProductPage";
import EditProductPage from "../EditProductPage/EditProductPage";
import ViewProductPage from "../ViewProductPage/ViewProductPage";

const PAGE_SIZE = 10;
const PRODUCT_FETCH_LIMIT = 1000;
type ViewMode = "list" | "add" | "edit" | "view";

function formatPrice(amount?: number, currency = "USD") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "-";
  if (currency === "VND" || currency === "VND") {
    return "VND " + amount.toLocaleString("vi-VN");
  }
  return amount.toLocaleString("vi-VN") + " " + currency;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, total, loading, error } = useAppSelector(
    (state) => state.products,
  );
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selected, setSelected] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getProducts({ limit: PRODUCT_FETCH_LIMIT }));
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;

    return products.filter(
      (product) =>
        (product.title ?? "").toLowerCase().includes(q) ||
        (product.categories ?? []).some((category) =>
          category.toLowerCase().includes(q),
        ),
    );
  }, [products, search]);

  const {
    page,
    totalPages,
    currentItems: paginated,
    pageNumbers,
    handlePageChange,
  } = usePagination(filtered, PAGE_SIZE);

  function goList() {
    setViewMode("list");
    setSelected(null);
  }

  function openView(product: Product) {
    setSelected(product);
    setViewMode("view");
  }

  function openEdit(product: Product) {
    setSelected(product);
    setViewMode("edit");
  }

  async function handleDelete(product: Product) {
    setDeletingId(product._id);
    await dispatch(deleteProduct(product._id));
    await dispatch(getProducts({ limit: PRODUCT_FETCH_LIMIT }));
    setDeletingId(null);
  }

  if (viewMode === "add") {
    return <AddProductPage onBack={goList} />;
  }

  if (viewMode === "edit" && selected) {
    return <EditProductPage product={selected} onBack={goList} />;
  }

  if (viewMode === "view" && selected) {
    return (
      <ViewProductPage product={selected} onBack={goList} onEdit={openEdit} />
    );
  }

  return (
    <div className="space-y-6 animate-page-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-72 rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-indigo-300"
            placeholder="Tìm tên sản phẩm, danh mục..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              handlePageChange(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Tổng: <strong>{total}</strong> sản phẩm
          </span>
          <button
            onClick={() => setViewMode("add")}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Plus size={16} />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-card-in delay-100">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            Danh sách sản phẩm
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="w-16 px-4 py-3 text-left">Ảnh</th>
                <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-center">Ngày tạo</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                paginated.map((product) => (
                  <tr
                    key={product._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {product.imageUrls?.[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.title}
                          className="h-10 w-10 rounded-lg border border-gray-100 object-cover"
                          onError={(event) => {
                            (event.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg text-gray-300">
                          #
                        </div>
                      )}
                    </td>
                    <td className="max-w-xs px-4 py-3 font-medium text-gray-800">
                      <span className="line-clamp-2">{product.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {(product.categories ?? [])
                          .slice(0, 2)
                          .map((category) => (
                            <span
                              key={category}
                              className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
                            >
                              {category}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-800">
                      {formatPrice(
                        product.price?.amount,
                        product.price?.currency,
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openView(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                          <Eye size={14} />
                          Xem
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Pencil size={14} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product._id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deletingId === product._id ? "Đang xóa" : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <p className="text-sm text-gray-500">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                Trước
              </button>
              {pageNumbers.map((item) => (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`h-8 w-8 rounded-lg text-sm transition-colors ${
                    page === item
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
