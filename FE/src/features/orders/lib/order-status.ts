import type { OrderStatus } from "@/features/orders/api/orders.api";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  awaiting_pickup: "Awaiting pickup",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment failed",
};

export function orderStatusClassName(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "awaiting_pickup":
      return "bg-violet-100 text-violet-800";
    case "shipping":
      return "bg-sky-100 text-sky-800";
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-zinc-200 text-zinc-600";
    case "payment_failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}
