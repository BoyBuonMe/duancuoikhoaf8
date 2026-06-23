"use client";

import { LazyImage } from "@/components/product/LazyImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth";
import { syncCartAfterOrder } from "@/features/cart/lib/sync-cart-after-order";
import { useOrdersList } from "@/features/orders";
import { useAppDispatch } from "@/store/hooks";
import { OrderStatusBadges, type Order } from "@/features/orders";
import { formatUsd } from "@/shared/lib/format-money";

function ClothesIllustration() {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="70" cy="70" r="58" fill="#e5e7eb" />
      <circle cx="34" cy="62" r="2.5" fill="#d1d5db" />
      <circle cx="34" cy="88" r="2" fill="#d1d5db" />
      <circle cx="104" cy="55" r="2.5" fill="#d1d5db" />
      <circle cx="108" cy="82" r="2" fill="#d1d5db" />
      <line
        x1="35"
        y1="50"
        x2="105"
        y2="50"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M52 50 Q52 42 59 42 Q66 42 66 50"
        stroke="#9ca3af"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M74 50 Q74 42 81 42 Q88 42 88 50"
        stroke="#9ca3af"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="43" y="50" width="9" height="14" rx="1" fill="#9ca3af" />
      <path d="M43 64 L43 84 L47.5 84 L47.5 64" fill="#9ca3af" />
      <path d="M52 64 L52 84 L47.5 84 L47.5 64" fill="#9ca3af" />
      <path
        d="M66 50 L61 60 L70 60 L70 86 L82 86 L82 60 L91 60 L86 50 Z"
        fill="#9ca3af"
      />
      <path
        d="M88 50 L84 58 L90 58 L90 76 L98 76 L98 58 L104 58 L100 50 Z"
        fill="#9ca3af"
      />
    </svg>
  );
}

function AccountOrdersEmptyState() {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <ClothesIllustration />
      <p className="mt-6 max-w-[260px] text-sm leading-relaxed text-zinc-500">
        You haven&apos;t made any orders yet. When you make an order it&apos;ll
        show up here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/women"
          className="rounded-full bg-zinc-900 px-7 py-3 text-xs font-bold tracking-widest text-white transition-colors hover:bg-zinc-700"
        >
          SHOP WOMENS
        </Link>
        <Link
          href="/men"
          className="rounded-full bg-zinc-900 px-7 py-3 text-xs font-bold tracking-widest text-white transition-colors hover:bg-zinc-700"
        >
          SHOP MENS
        </Link>
      </div>
    </div>
  );
}

function AccountOrderCard({ order }: { order: Order }) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <p className="font-mono text-xs font-bold tracking-wide text-zinc-900 sm:text-sm">
          {order.orderCode}
        </p>
        <OrderStatusBadges order={order} />
      </div>

      <ul className="divide-y divide-zinc-100">
        {order.items.map((item) => (
          <li
            key={`${order.orderCode}-${item.sku}`}
            className="flex items-start gap-3 px-4 py-3"
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 sm:size-20">
              {item.image ? (
                <LazyImage
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {item.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {item.size || item.variantLabel || ""}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
              {formatUsd(item.unitPrice.amount * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-500 sm:text-sm">
        <span>
          {new Date(order.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
        <span className="font-bold text-zinc-900">
          Total: {formatUsd(order.total.amount)}
        </span>
      </div>
    </article>
  );
}

function useClientMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface AccountOrdersSectionProps {
  placedOrderCode?: string | null;
  highlightOrders?: boolean;
  paymentPendingMessage?: string | null;
  paymentFailedMessage?: string | null;
}

export function AccountOrdersSection({
  placedOrderCode = null,
  highlightOrders = false,
  paymentPendingMessage = null,
  paymentFailedMessage = null,
}: AccountOrdersSectionProps) {
  const mounted = useClientMounted();
  const { isAuthenticated } = useAuth();
  const { orders, isLoading, error } = useOrdersList();

  const visibleOrders = mounted && isAuthenticated ? orders : [];
  const visibleLoading = !mounted || (isAuthenticated && isLoading);
  const visibleError = mounted && isAuthenticated ? error : null;

  return (
    <section
      id="account-orders-section"
      className={`flex min-h-0 flex-col overflow-hidden ${
        highlightOrders ? "animate-orders-section-reveal" : ""
      }`}
      style={{ backgroundColor: "#F5F5F5", padding: "32px" }}
    >
      <h2 className="mb-4 shrink-0 text-xs font-bold tracking-[0.2em] uppercase text-zinc-900">
        Orders
      </h2>

      {paymentPendingMessage ? (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          {paymentPendingMessage}
        </div>
      ) : null}

      {paymentFailedMessage ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {paymentFailedMessage}
        </div>
      ) : null}

      {placedOrderCode ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Order placed successfully! Code:{" "}
          <span className="font-mono font-bold">{placedOrderCode}</span>
        </div>
      ) : null}

      {visibleLoading ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Loading orders...
        </p>
      ) : visibleError ? (
        <p className="py-8 text-center text-sm text-red-600">{visibleError}</p>
      ) : visibleOrders.length === 0 ? (
        <AccountOrdersEmptyState />
      ) : (
        <div className="scrollbar-hidden min-h-0 max-h-[min(560px,65vh)] overflow-y-auto pr-1">
          <div className="flex flex-col gap-4">
            {visibleOrders.map((order) => (
              <AccountOrderCard key={order._id} order={order} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function AccountOrdersSectionWithParams() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const initialPlacedOrderCode = searchParams.get("placed");
  const scrollTarget = searchParams.get("scroll");
  const paymentStatus = searchParams.get("payment");
  const failedOrderCode = searchParams.get("orderCode");
  const [placedOrderCode] = useState<string | null>(initialPlacedOrderCode);
  const [highlightOrders, setHighlightOrders] = useState(false);

  const paymentFailedMessage =
    paymentStatus === "failed"
      ? failedOrderCode
        ? `Payment was not completed. Order ${failedOrderCode} was saved as payment failed — you can retry checkout.`
        : "Payment was not completed or the session expired. Please try again."
      : null;

  useEffect(() => {
    if (!initialPlacedOrderCode) return;
    syncCartAfterOrder(dispatch);
  }, [dispatch, initialPlacedOrderCode]);

  useEffect(() => {
    if (scrollTarget !== "orders") return;

    const section = document.getElementById("account-orders-section");
    if (!section) return;

    const scrollTimer = window.setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightOrders(true);
      window.setTimeout(() => setHighlightOrders(false), 1800);
    }, 200);

    return () => window.clearTimeout(scrollTimer);
  }, [scrollTarget]);

  return (
    <AccountOrdersSection
      placedOrderCode={placedOrderCode}
      highlightOrders={highlightOrders}
      paymentPendingMessage={null}
      paymentFailedMessage={paymentFailedMessage}
    />
  );
}
