import type { Order } from "@/features/orders/api/orders.api";
import {
  ORDER_STATUS_LABELS,
  orderStatusClassName,
} from "@/features/orders/lib/order-status";

interface OrderStatusBadgesProps {
  order: Order;
  size?: "sm" | "md";
}

export function OrderStatusBadges({ order, size = "sm" }: OrderStatusBadgesProps) {
  const textSize =
    size === "md"
      ? "text-xs sm:text-sm"
      : "text-[10px] sm:text-xs";

  const isPaymentFailed = order.status === "payment_failed";

  return (
    <div className="flex shrink-0 items-center gap-2">
      {order.isPay ? (
        <span
          className={`rounded-full bg-emerald-500 px-2.5 py-1 font-bold uppercase tracking-wide text-white ${textSize}`}
        >
          Paid
        </span>
      ) : isPaymentFailed ? (
        <span
          className={`rounded-full bg-red-500 px-2.5 py-1 font-bold uppercase tracking-wide text-white ${textSize}`}
        >
          Payment failed
        </span>
      ) : null}
      <span
        className={`rounded-full px-2.5 py-1 font-bold uppercase tracking-wide ${textSize} ${orderStatusClassName(order.status)}`}
      >
        {ORDER_STATUS_LABELS[order.status]}
      </span>
    </div>
  );
}
