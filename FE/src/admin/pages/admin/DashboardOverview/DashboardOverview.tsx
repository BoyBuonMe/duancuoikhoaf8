"use client";

import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/admin/hooks/hooks";
import { getUsers } from "@/admin/features/admin/adminUsersSlice";
import { getOrders } from "@/admin/features/orders/ordersSlice";
import { getProducts } from "@/admin/features/products/productsSlice";
import type { Order } from "@/admin/services/orders/ordersService";
import type { Product } from "@/admin/services/products/productsService";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Eye,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
} as const;

const toneClass: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-500",
};

const PRODUCT_FETCH_LIMIT = 1000;

function formatPrice(amount: number, currency = "USD") {
  if (!Number.isFinite(amount)) return `0 ${currency}`;
  return amount.toLocaleString("vi-VN") + " " + currency;
}

function formatCompactPrice(amount: number, currency = "USD") {
  if (!Number.isFinite(amount)) return `0 ${currency}`;
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount) + ` ${currency}`;
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

function getProductDate(product: Product) {
  const rawDate = product.createdAt ?? product.updatedAt ?? product.scrapedAt;
  const date = new Date(rawDate ?? 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getProductImage(product: Product) {
  return product.imageUrls?.[0] ?? "";
}

function getProductPrice(product: Product) {
  return product.price?.amount ?? 0;
}

function getProductCurrency(product: Product) {
  return product.price?.currency ?? "USD";
}

function toNumber(value: unknown, fallback: number | null = null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
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

function getOrderItems(order: Order) {
  return order.items ?? order.products ?? [];
}

function getItemQuantity(item: ReturnType<typeof getOrderItems>[number]) {
  return toNumber(item.quantity, 1) ?? 1;
}

function getItemPrice(item: ReturnType<typeof getOrderItems>[number]) {
  return toNumber(item.price ?? item.unitPrice ?? item.amount ?? item.total ?? item.totalPrice) ?? 0;
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

function getOrderTotal(order: Order) {
  const explicitTotal = toNumber(getOrderTotalValue(order));
  if (explicitTotal !== null) return explicitTotal;

  return getOrderItems(order).reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
    0,
  );
}

function getOrderCurrency(order: Order) {
  return getCurrency(getOrderTotalValue(order)) ?? "USD";
}

function getOrderStatus(order: Order) {
  if (order.status === "processing") return "pending";
  if (order.status === "shipped") return "shipping";
  return order.status ?? "pending";
}

function getOrderCode(order: Order) {
  return order.orderCode ?? order.code ?? order.orderNumber ?? order._id ?? order.id ?? "";
}

function getCustomerName(order: Order) {
  const email =
    order.customerEmail ??
    order.userEmail ??
    order.customer?.email ??
    order.user?.email ??
    order.email ??
    "";

  return (
    [
      order.customerName,
      order.userName,
      order.customer?.name,
      order.user?.name,
      email.split("@")[0],
    ].find(Boolean) || "Khách hàng"
  );
}

function buildRevenueChartData(orders: Order[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const dailyOrders = orders.filter((order) => {
        if (!order.createdAt) return false;
        const createdAt = new Date(order.createdAt);
        return createdAt >= day && createdAt < nextDay;
      });

    return {
      date: day.toISOString(),
      label: day.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue: dailyOrders.reduce((sum, order) => sum + getOrderTotal(order), 0),
      orderCount: dailyOrders.length,
    };
  });
}

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const { users, loading: usersLoading } = useAppSelector((s) => s.adminUsers);
  const {
    orders,
    total: totalOrders,
    loading: ordersLoading,
  } = useAppSelector((s) => s.orders);
  const {
    products,
    total: totalProducts,
    loading: productsLoading,
  } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getOrders());
    dispatch(getProducts({ limit: PRODUCT_FETCH_LIMIT }));
  }, [dispatch]);

  const dashboardData = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const currency = orders[0] ? getOrderCurrency(orders[0]) : "USD";
    const deliveredOrders = orders.filter((order) => getOrderStatus(order) === "delivered").length;
    const cancelledOrders = orders.filter((order) => getOrderStatus(order) === "cancelled").length;
    const activeUsers = users.filter((user) => user.status === "active").length;
    const averageOrder = orders.length > 0 ? revenue / orders.length : 0;
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 5);
    const recentProducts = [...products]
      .sort((a, b) => getProductDate(b) - getProductDate(a))
      .slice(0, 3);

    return {
      revenue,
      currency,
      deliveredOrders,
      cancelledOrders,
      activeUsers,
      averageOrder,
      recentOrders,
      recentProducts,
      chartData: buildRevenueChartData(orders),
    };
  }, [orders, products, users]);

  const stats = [
    {
      label: "Tổng doanh thu",
      value: ordersLoading
        ? "..."
        : formatPrice(dashboardData.revenue, dashboardData.currency),
      change: `${orders.length} đơn`,
      icon: Wallet,
      color: "violet",
    },
    {
      label: "Đơn hàng",
      value: ordersLoading ? "..." : String(totalOrders || orders.length),
      change: `${dashboardData.deliveredOrders} đã giao`,
      icon: ShoppingCart,
      color: "emerald",
    },
    {
      label: "Người dùng",
      value: usersLoading ? "..." : String(users.length),
      change: `${dashboardData.activeUsers} active`,
      icon: Users,
      color: "sky",
    },
    {
      label: "Sản phẩm",
      value: productsLoading ? "..." : String(totalProducts || products.length),
      change: `${products.length} đã tải`,
      icon: Package,
      color: "amber",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} delay={index * 70} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
        <section className="dashboard-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Doanh thu</h2>
              <div className="mt-3 flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-950">
                  {formatPrice(dashboardData.revenue, dashboardData.currency)}
                </p>
                <p className="mb-1 flex items-center gap-1 text-sm font-medium text-emerald-600">
                  <ArrowUpRight size={15} />
                  Tổng từ {orders.length} đơn hàng
                </p>
              </div>
            </div>
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
              Dữ liệu thật
            </span>
          </div>
          <div className="h-64 rounded-xl bg-gradient-to-b from-violet-50 to-white px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dashboardData.chartData}
                margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e9d5ff" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  yAxisId="revenue"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) =>
                    formatCompactPrice(Number(value), dashboardData.currency)
                  }
                  width={58}
                />
                <YAxis yAxisId="orders" hide />
                <Tooltip
                  cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                  }}
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return [formatPrice(Number(value), dashboardData.currency), "Doanh thu"];
                    }
                    return [`${Number(value)} đơn`, "Số đơn"];
                  }}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                  dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6d28d9", stroke: "#ffffff", strokeWidth: 2 }}
                />
                <Bar
                  yAxisId="orders"
                  dataKey="orderCount"
                  barSize={14}
                  fill="#a78bfa"
                  opacity={0.32}
                  radius={[6, 6, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MiniStat label="Tổng đơn" value={String(orders.length)} />
            <MiniStat label="Đã giao" value={String(dashboardData.deliveredOrders)} />
            <MiniStat label="Đã hủy" value={String(dashboardData.cancelledOrders)} down />
            <MiniStat
              label="Giá trị TB"
              value={formatPrice(dashboardData.averageOrder, dashboardData.currency)}
            />
          </div>
        </section>

        <section className="dashboard-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-bold text-slate-950">Đơn hàng gần đây</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {dashboardData.recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                Chưa có đơn hàng
              </div>
            ) : (
              dashboardData.recentOrders.map((order) => {
                const status = getOrderStatus(order);
                const tone =
                  status === "delivered"
                    ? "green"
                    : status === "cancelled"
                      ? "red"
                      : status === "shipping"
                        ? "amber"
                        : "slate";

                return (
                  <div key={getOrderCode(order)} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <ShoppingCart size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-950">
                        #{getOrderCode(order)}
                      </p>
                      <p className="truncate text-sm text-slate-500">{getCustomerName(order)}</p>
                    </div>
                    <span className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${toneClass[tone]}`}>
                      {STATUS_LABELS[status]}
                    </span>
                    <p className="w-24 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                      {formatPrice(getOrderTotal(order), getOrderCurrency(order))}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_1fr]">
        <section className="dashboard-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-bold text-slate-950">Sản phẩm mới nhất</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {dashboardData.recentProducts.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                Chưa có sản phẩm
              </div>
            ) : (
              dashboardData.recentProducts.map((product, index) => (
                <div key={product._id} className="grid grid-cols-[48px_1fr_112px] items-center gap-4 px-6 py-4">
                  <p className="text-sm font-bold text-slate-400">#{index + 1}</p>
                  <div className="flex min-w-0 items-center gap-3">
                    {getProductImage(product) ? (
                      <img
                        src={getProductImage(product)}
                        alt={product.title}
                        className="h-11 w-11 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Package size={18} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{product.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(product.createdAt ?? product.updatedAt ?? product.scrapedAt)}</p>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-right text-sm font-bold text-slate-900">
                    {formatPrice(getProductPrice(product), getProductCurrency(product))}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="dashboard-card p-6">
          <h2 className="mb-4 text-base font-bold text-slate-950">Thống kê nhanh</h2>
          <div className="space-y-1">
            <QuickStat icon={BarChart3} label="Đơn đã giao" value={String(dashboardData.deliveredOrders)} change="real" up />
            <QuickStat icon={ShoppingCart} label="Giá trị đơn TB" value={formatPrice(dashboardData.averageOrder, dashboardData.currency)} change="real" up />
            <QuickStat icon={Eye} label="Người dùng hoạt động" value={String(dashboardData.activeUsers)} change="real" up />
            <QuickStat icon={Activity} label="Đơn đã hủy" value={String(dashboardData.cancelledOrders)} change="real" />
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  down = false,
}: {
  label: string;
  value: string;
  down?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-bold text-slate-950">{value}</p>
      <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${down ? "text-red-500" : "text-emerald-600"}`}>
        {down ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
        Real data
      </p>
    </div>
  );
}

function StatCard({
  stat,
  delay,
}: {
  stat: {
    label: string;
    value: string;
    change: string;
    icon: React.ElementType;
    color: "violet" | "emerald" | "sky" | "amber";
  };
  delay: number;
}) {
  const colorMap = {
    violet: "bg-violet-50 text-violet-600 from-violet-500/30",
    emerald: "bg-emerald-50 text-emerald-600 from-emerald-500/30",
    sky: "bg-sky-50 text-sky-600 from-sky-500/30",
    amber: "bg-amber-50 text-amber-600 from-amber-500/30",
  };
  const Icon = stat.icon;

  return (
    <section
      className="dashboard-card dashboard-card-enter p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorMap[stat.color]}`}>
          <Icon size={20} />
        </div>
        <p className="font-semibold text-slate-800">{stat.label}</p>
      </div>
      <p className="mt-5 truncate text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
      <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
        <ArrowUpRight size={15} className="text-emerald-600" />
        <span className="font-semibold text-emerald-600">{stat.change}</span>
      </p>
      <div className={`mt-4 h-14 rounded-xl bg-gradient-to-t ${colorMap[stat.color]} to-transparent opacity-80`} />
    </section>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  change,
  up = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  up?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl px-1 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <Icon size={18} />
      </div>
      <p className="flex-1 text-sm text-slate-600">{label}</p>
      <p className="whitespace-nowrap text-sm font-bold text-slate-950">{value}</p>
      <p className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
        {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {change}
      </p>
    </div>
  );
}
