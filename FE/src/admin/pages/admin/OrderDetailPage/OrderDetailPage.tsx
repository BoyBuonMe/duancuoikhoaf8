"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Mail, MapPin, Phone, ReceiptText, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/admin/hooks/hooks";
import { getOrders } from "@/admin/features/orders/ordersSlice";
import {
  getOrderError,
  getDetailOrder,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "@/admin/services/orders/ordersService";

type Props = {
  order: Order;
  onBack: () => void;
};

type OrderDetailFormValues = {
  status: OrderStatus;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

function formatPrice(value: number, currency = "USD") {
  if (!Number.isFinite(value)) return `0 ${currency}`;
  return value.toLocaleString("vi-VN") + " " + currency;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
}

function readDetailResponse(response: Awaited<ReturnType<typeof getDetailOrder>>) {
  if ("order" in response) return response.order;
  if ("order" in response.data) return response.data.order;
  return response.data;
}

function readUpdateResponse(response: Awaited<ReturnType<typeof updateOrderStatus>>) {
  if ("order" in response) return response.order;
  if ("order" in response.data) return response.data.order;
  return response.data;
}

function getOrderCode(order: Order) {
  return order.orderCode ?? order.code ?? order.orderNumber ?? order._id ?? order.id ?? "";
}

function getOrderDetailKeys(order: Order) {
  return [
    order.orderCode,
    order.code,
    order.orderNumber,
    order._id,
    order.id,
  ].filter((item): item is string => Boolean(item));
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

function getShippingAddress(order: Order) {
  return formatAddress(order.shippingAddress ?? order.address);
}

function formatAddress(value: Order["shippingAddress"]) {
  if (!value) return "";
  if (typeof value === "string") return value;

  return [
    value.streetAddress,
    value.wardCode ? `Ward ${value.wardCode}` : "",
    value.provinceCode ? `Province ${value.provinceCode}` : "",
  ]
    .filter(Boolean)
    .join(", ");
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

function getItemCurrency(item: ReturnType<typeof getOrderItems>[number]) {
  return (
    getCurrency(item.price) ??
    getCurrency(item.unitPrice) ??
    getCurrency(item.amount) ??
    getCurrency(item.total) ??
    getCurrency(item.totalPrice) ??
    "USD"
  );
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

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
        <Icon size={15} />
        {label}
      </div>
      <p className="break-words text-sm font-semibold text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}

export default function OrderDetailPage({ order, onBack }: Props) {
  const dispatch = useAppDispatch();
  const [detail, setDetail] = useState<Order>(order);
  const [loading, setLoading] = useState(false);
  const [error, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccessMessage] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting },
  } = useForm<OrderDetailFormValues>({
    defaultValues: {
      status: getOrderStatus(order),
    },
  });

  useEffect(() => {
    let active = true;

    async function fetchDetail() {
      const detailKeys = getOrderDetailKeys(order);
      if (detailKeys.length === 0) return;

      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        let nextDetail: Order | null = null;
        let lastError: unknown = null;

        for (const key of detailKeys) {
          try {
            nextDetail = readDetailResponse(await getDetailOrder(key));
            break;
          } catch (err) {
            lastError = err;
          }
        }

        if (!nextDetail) throw lastError;
        if (!active) return;
        setDetail(nextDetail);
        reset({ status: getOrderStatus(nextDetail) });
      } catch (err) {
        if (!active) return;
        setErrorMessage(getOrderError(err, "Không thể tải chi tiết đơn hàng"));
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      active = false;
    };
  }, [order, reset]);

  async function submitStatus(values: OrderDetailFormValues) {
    const detailKeys = getOrderDetailKeys(detail);
    if (detailKeys.length === 0) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    let updatedOrder: Order | null = null;
    let lastError: unknown = null;

    for (const key of detailKeys) {
      try {
        updatedOrder = readUpdateResponse(await updateOrderStatus(key, values.status));
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!updatedOrder) {
      setErrorMessage(getOrderError(lastError, "Không thể cập nhật trạng thái đơn hàng"));
      return;
    }

    const nextDetail = { ...detail, ...updatedOrder, status: values.status };
    setDetail(nextDetail);
    reset({ status: getOrderStatus(nextDetail) });
    await dispatch(getOrders());
    setSuccessMessage("Đã cập nhật trạng thái đơn hàng");
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

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Chi tiết đơn #{getOrderCode(detail)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tạo lúc {formatDate(detail.createdAt)}
          </p>
        </div>
        <div className="rounded-2xl bg-white px-5 py-3 text-right shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Tổng tiền
          </p>
          <p className="text-xl font-bold text-slate-950">
            {formatPrice(getOrderTotal(detail), getOrderTotalCurrency(detail))}
          </p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(submitStatus)}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {success}
          </p>
        )}
        {loading && (
          <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-600">
            Đang tải chi tiet đơn hàng...
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="dashboard-card p-6">
            <h2 className="mb-4 text-base font-bold text-slate-950">
              Thông tin khách hàng
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Khách hàng" value={getCustomerName(detail)} icon={UserRound} />
              <Info label="Email" value={getCustomerEmail(detail)} icon={Mail} />
              <Info label="Số điện thoại" value={getCustomerPhone(detail)} icon={Phone} />
              <Info label="Địa chỉ giao hàng" value={getShippingAddress(detail)} icon={MapPin} />
            </div>
          </div>

          <div className="dashboard-card p-6">
            <h2 className="mb-4 text-base font-bold text-slate-950">
              Xử lý đơn hàng
            </h2>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Trạng thái
              </span>
              <select {...register("status")} className="form-input">
                {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu trạng thái"}
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-card overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
              <ReceiptText size={18} />
              Sản phẩm trong đơn
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-6 py-3 text-left">Sản phẩm</th>
                  <th className="px-6 py-3 text-center">Số lượng</th>
                  <th className="px-6 py-3 text-right">Đơn giá</th>
                  <th className="px-6 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getOrderItems(detail).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                      Đơn hàng chưa có sản phẩm
                    </td>
                  </tr>
                ) : (
                  getOrderItems(detail).map((item, index) => (
                    <tr key={item._id ?? `${item.title}-${index}`}>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {item.title ?? item.name ?? "Sản phẩm"}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {getItemQuantity(item)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {formatPrice(getItemPrice(item), getItemCurrency(item))}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatPrice(
                          getItemPrice(item) * getItemQuantity(item),
                          getItemCurrency(item),
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}
