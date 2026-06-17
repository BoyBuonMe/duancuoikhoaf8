"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/admin/hooks/hooks";
import usePagination from "@/admin/hooks/usePagination";
import { getOrders } from "@/admin/features/orders/ordersSlice";
import {
  type Order,
  type OrderStatus,
} from "@/admin/services/orders/ordersService";
import OrderDetailPage from "../OrderDetailPage/OrderDetailPage";

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  shipping: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

function formatPrice(value: number, currency = "USD") {
  if (!Number.isFinite(value)) return `0 ${currency}`;
  return value.toLocaleString("vi-VN") + " " + currency;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

function formatPaymentMethod(value?: string) {
  const method = value?.trim();
  if (!method) return "-";
  return method.toUpperCase();
}

function getOrderId(order: Order) {
  return order._id ?? order.id ?? "";
}

function getOrderCode(order: Order) {
  return order.orderCode ?? order.code ?? order.orderNumber ?? getOrderId(order);
}

function getCustomerName(order: Order) {
  return (
    [
      order.customerName,
      order.userName,
      order.customer?.name,
      order.user?.name,
      getCustomerEmail(order).split("@")[0],
    ].find(Boolean) || "Khách hàng"
  );
}

function getCustomerEmail(order: Order) {
  return (
    order.customerEmail ??
    order.userEmail ??
    order.customer?.email ??
    order.user?.email ??
    order.email ??
    ""
  );
}

function getCustomerPhone(order: Order) {
  return (
    order.customerPhone ??
    order.userPhone ??
    order.customer?.phone ??
    order.user?.phone ??
    order.phone ??
    ""
  );
}

function getPaymentMethod(order: Order) {
  return order.paymentMethod ?? order.payment?.method ?? order.payment?.provider ?? "";
}

function getOrderItems(order: Order) {
  return order.items ?? order.products ?? [];
}

function getOrderTotal(order: Order) {
  const explicitTotal = toNumber(getOrderTotalValue(order));

  if (explicitTotal !== null) return explicitTotal;

  return getOrderItems(order).reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
    0,
  );
}

function getOrderTotalCurrency(order: Order) {
  return getCurrency(getOrderTotalValue(order)) ?? "USD";
}

function getOrderTotalValue(order: Order) {
  return (
    order.totalAmount ??
    order.total ??
    order.totalPrice ??
    order.finalTotal ??
    order.grandTotal ??
    order.summary?.total ??
    order.summary?.grandTotal ??
    order.summary?.subtotal ??
    order.pricing?.total ??
    order.pricing?.grandTotal ??
    order.pricing?.subtotal ??
    order.subtotal
  );
}

function getItemPrice(item: ReturnType<typeof getOrderItems>[number]) {
  return toNumber(item.price ?? item.unitPrice ?? item.amount ?? item.total ?? item.totalPrice) ?? 0;
}

function getItemQuantity(item: ReturnType<typeof getOrderItems>[number]) {
  return toNumber(item.quantity, 1) ?? 1;
}

function toNumber(value: unknown, fallback: number | null = null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const numberValue = Number(normalized);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  if (value && typeof value === "object" && "amount" in value) {
    return toNumber(value.amount, fallback);
  }

  return fallback;
}

function getCurrency(value: unknown) {
  if (value && typeof value === "object" && "currency" in value) {
    return typeof value.currency === "string" ? value.currency : undefined;
  }
  return undefined;
}

function getOrderStatus(order: Order): OrderStatus {
  if (order.status === "processing") return "pending";
  if (order.status === "shipped") return "shipping";
  return order.status ?? "pending";
}

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "all" || getOrderStatus(order) === statusFilter;
      const matchSearch =
        !q ||
        getOrderCode(order).toLowerCase().includes(q) ||
        getCustomerName(order).toLowerCase().includes(q) ||
        getCustomerEmail(order).toLowerCase().includes(q) ||
        getOrderItems(order).some((item) =>
          (item.title ?? item.name ?? "").toLowerCase().includes(q),
        );

      return matchStatus && matchSearch;
    });
  }, [orders, search, statusFilter]);

  const {
    page,
    totalPages,
    currentItems: paginated,
    pageNumbers,
    handlePageChange,
  } = usePagination(filtered, PAGE_SIZE);

  if (selected) {
    return <OrderDetailPage order={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6 animate-page-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-72 rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-indigo-300"
              placeholder="Tìm mã đơn, khách hàng, sản phẩm..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                handlePageChange(1);
              }}
            />
          </div>

          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-300"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as "all" | OrderStatus);
              handlePageChange(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <span className="text-sm text-gray-500">
          Tổng: <strong>{filtered.length}</strong> đơn hàng
        </span>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-5">
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
          <div
            key={status}
            className={`rounded-2xl p-4 ring-1 ${STATUS_COLORS[status]}`}
          >
            <p className="text-xs font-semibold uppercase">{STATUS_LABELS[status]}</p>
            <p className="mt-1 text-2xl font-bold">
              {orders.filter((order) => getOrderStatus(order) === status).length}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-card-in delay-100">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            Danh sách đơn hàng
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full table-fixed text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                <th className="w-[150px] whitespace-nowrap px-4 py-3 text-left">Mã đơn</th>
                <th className="w-[210px] whitespace-nowrap px-4 py-3 text-left">Khách hàng</th>
                <th className="w-[270px] whitespace-nowrap px-4 py-3 text-left">Sản phẩm</th>
                <th className="w-[70px] whitespace-nowrap px-4 py-3 text-center">SL</th>
                <th className="w-[120px] whitespace-nowrap px-4 py-3 text-right">Tổng tiền</th>
                <th className="w-[150px] whitespace-nowrap px-4 py-3 text-center">Thanh toán</th>
                <th className="w-[130px] whitespace-nowrap px-4 py-3 text-center">Trạng thái</th>
                <th className="w-[120px] whitespace-nowrap px-4 py-3 text-center">Ngày đặt</th>
                <th className="w-[110px] whitespace-nowrap px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                paginated.map((order) => (
                  <tr key={getOrderId(order)} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-indigo-600">
                      <span className="block truncate">#{getOrderCode(order)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="truncate font-semibold text-gray-900">
                        {getCustomerName(order)}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {getCustomerEmail(order) || getCustomerPhone(order) || "-"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      <span className="block truncate">
                        {getOrderItems(order)
                          .map((item) => item.title ?? item.name)
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-600">
                      {getOrderItems(order).reduce(
                        (sum, item) => sum + getItemQuantity(item),
                        0,
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-900">
                      {formatPrice(getOrderTotal(order), getOrderTotalCurrency(order))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-700">
                      {formatPaymentMethod(getPaymentMethod(order))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_COLORS[getOrderStatus(order)]}`}
                      >
                        {STATUS_LABELS[getOrderStatus(order)]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelected(order)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                          <Eye size={14} />
                          Xem
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
