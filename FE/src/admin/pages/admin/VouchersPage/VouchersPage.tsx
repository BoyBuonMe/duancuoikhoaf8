"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, TicketPercent, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/admin/hooks/hooks";
import usePagination from "@/admin/hooks/usePagination";
import { getVouchers } from "@/admin/features/vouchers/vouchersSlice";
import {
  deleteVoucher,
  type Voucher,
  type VoucherStatus,
  type VoucherType,
} from "@/admin/services/vouchers/vouchersService";
import AddVoucherPage from "../AddVoucherPage/AddVoucherPage";
import EditVoucherPage from "../EditVoucherPage/EditVoucherPage";

const PAGE_SIZE = 10;

const TYPE_LABELS: Record<VoucherType, string> = {
  percent: "Phần trăm",
  fixed: "Cố định",
};

const STATUS_LABELS: Record<VoucherStatus, string> = {
  active: "Hoạt động",
  inactive: "Tạm tắt",
};

const STATUS_CLASSES: Record<VoucherStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
};

type ViewMode = "list" | "add" | "edit";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

function formatValue(voucher: Voucher) {
  if (voucher.type === "percent") return `${voucher.value}%`;
  return voucher.value.toLocaleString("vi-VN") + " VND";
}

export default function VouchersPage() {
  const dispatch = useAppDispatch();
  const { vouchers, loading, error } = useAppSelector(
    (state) => state.vouchers,
  );
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selected, setSelected] = useState<Voucher | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getVouchers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vouchers;

    return vouchers.filter(
      (voucher) =>
        voucher.code.toLowerCase().includes(q) ||
        voucher.label.toLowerCase().includes(q) ||
        voucher.type.toLowerCase().includes(q) ||
        voucher.status.toLowerCase().includes(q) ||
        voucher.conditions.categoryKeywords.some((item) =>
          item.toLowerCase().includes(q),
        ) ||
        voucher.conditions.titleKeywords.some((item) =>
          item.toLowerCase().includes(q),
        ) ||
        voucher.productSourceUrls.some((item) => item.toLowerCase().includes(q)),
    );
  }, [search, vouchers]);

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
    setActionError(null);
  }

  function openEdit(voucher: Voucher) {
    setSelected(voucher);
    setViewMode("edit");
  }

  async function handleDelete(voucher: Voucher) {
    setDeletingId(voucher._id);
    setActionError(null);
    try {
      await deleteVoucher(voucher._id);
      await dispatch(getVouchers()).unwrap();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Không thể xóa voucher",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (viewMode === "add") {
    return <AddVoucherPage onBack={goList} />;
  }

  if (viewMode === "edit" && selected) {
    return <EditVoucherPage voucher={selected} onBack={goList} />;
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
            placeholder="Tìm mã voucher, loại, trạng thái..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              handlePageChange(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Tổng: <strong>{filtered.length}</strong> voucher
          </span>
          <button
            onClick={() => setViewMode("add")}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Plus size={16} />
            Thêm voucher
          </button>
        </div>
      </div>

      {(error || actionError) && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError ?? error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-card-in delay-100">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            Danh sách voucher
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 text-left">Mã</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-right">Giá trị</th>
                <th className="px-4 py-3 text-right">Đơn tối thiểu</th>
                <th className="px-4 py-3 text-center">Lượt dùng</th>
                <th className="px-4 py-3 text-center">Thời gian</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
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
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Chưa có voucher nào
                  </td>
                </tr>
              ) : (
                paginated.map((voucher) => (
                  <tr
                    key={voucher._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <TicketPercent size={18} />
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {voucher.code}
                          </p>
                          <p className="text-xs text-gray-400">
                            {voucher.label || `Tạo: ${formatDate(voucher.createdAt)}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {TYPE_LABELS[voucher.type]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900">
                      {formatValue(voucher)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600">
                      {(voucher.minOrderValue ?? 0).toLocaleString("vi-VN")} USD
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-600">
                      {voucher.usedCount ?? 0}
                      {voucher.usageLimit ? ` / ${voucher.usageLimit}` : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-500">
                      Hết hạn: {formatDate(voucher.endDate)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_CLASSES[voucher.status]}`}
                      >
                        {STATUS_LABELS[voucher.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(voucher)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <Pencil size={14} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(voucher)}
                          disabled={deletingId === voucher._id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deletingId === voucher._id ? "Đang xóa" : "Xóa"}
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
