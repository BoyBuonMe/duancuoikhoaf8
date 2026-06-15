"use client";

import { LazyImage } from "@/components/product/LazyImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  OrderStatusBadges,
  useOrdersList,
  type Order,
  type OrderItem,
} from "@/features/orders";
import { deliveryMethodLabel, paymentMethodLabel } from "@/features/orders/lib/order-labels";
import { formatOrderShippingAddress } from "@/features/orders/lib/format-shipping-address";
import { useOrderRelatedProducts } from "@/features/orders/hooks/useOrderRelatedProducts";
import { productSlugFromSourceUrl, useProductCache } from "@/features/products";
import { formatUsd } from "@/shared/lib/format-money";
import { cn } from "@/lib/utils";

function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-900">
        No orders yet
      </p>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Your orders will appear here after checkout.
      </p>
      <Link
        href="/products"
        className="mt-8 rounded-full bg-zinc-900 px-7 py-3 text-xs font-bold tracking-widest text-white transition-colors hover:bg-zinc-700"
      >
        SHOP NOW
      </Link>
    </div>
  );
}

function OrderShippingSection({ order }: { order: Order }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
        Shipping address
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-zinc-700">
        {formatOrderShippingAddress(order)}
      </p>
      <div className="mt-4 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
        <p>
          <span className="font-semibold text-zinc-700">Delivery: </span>
          {deliveryMethodLabel(order.deliveryMethod)}
        </p>
        <p>
          <span className="font-semibold text-zinc-700">Payment: </span>
          {paymentMethodLabel(order.paymentMethod)}
        </p>
      </div>
    </section>
  );
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const sizeLabel = item.size || item.variantLabel;

  return (
    <li className="flex gap-4 border-b border-zinc-100 py-4 last:border-b-0">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:size-24">
        {item.image ? (
          <LazyImage
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-900 sm:text-base">
          {item.name}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 sm:text-sm">
          {sizeLabel ? <span>Size: {sizeLabel}</span> : null}
          <span>Qty: {item.quantity}</span>
        </div>
        <p className="mt-2 text-sm font-semibold tabular-nums text-zinc-900">
          {formatUsd(item.unitPrice.amount * item.quantity)}
        </p>
      </div>
    </li>
  );
}

function OrderInfoSection({ order }: { order: Order }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Order code
          </p>
          <p className="mt-1 font-mono text-base font-bold text-zinc-900 sm:text-lg">
            {order.orderCode}
          </p>
        </div>
        <OrderStatusBadges order={order} size="md" />
      </div>

      <ul className="divide-y divide-zinc-100">
        {order.items.map((item) => (
          <OrderItemRow
            key={`${order.orderCode}-${item.sku}`}
            item={item}
          />
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm">
        <div className="flex items-center justify-between text-zinc-500">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatUsd(order.subtotal.amount)}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-500">
          <span>Shipping</span>
          <span className="tabular-nums">{formatUsd(order.shippingFee)}</span>
        </div>
        {order.voucherDiscount > 0 ? (
          <div className="flex items-center justify-between text-emerald-700">
            <span>Voucher{order.voucherCode ? ` (${order.voucherCode})` : ""}</span>
            <span className="tabular-nums">
              -{formatUsd(order.voucherDiscount)}
            </span>
          </div>
        ) : null}
        {(order.promoDiscount ?? 0) > 0 ? (
          <div className="flex items-center justify-between text-emerald-700">
            <span>Code{order.promoCode ? ` (${order.promoCode})` : ""}</span>
            <span className="tabular-nums">
              -{formatUsd(order.promoDiscount ?? 0)}
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-bold text-zinc-900">
          <span>Total</span>
          <span className="tabular-nums">{formatUsd(order.total.amount)}</span>
        </div>
        <p className="text-xs text-zinc-400">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
      </div>
    </section>
  );
}

function OrderContactSection() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
          <MessageCircle className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-bold uppercase tracking-wide text-zinc-900">
            Contact seller
          </span>
          <span className="mt-1 block text-sm text-zinc-500">
            Message the seller about your order.
          </span>
        </span>
      </button>

      <button
        type="button"
        className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
          <Phone className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-bold uppercase tracking-wide text-zinc-900">
            Contact Gymshark
          </span>
          <span className="mt-1 block text-sm text-zinc-500">
            24/7 customer support from the Gymshark team.
          </span>
        </span>
      </button>
    </section>
  );
}

function RelatedProductCard({
  product,
  onCache,
}: {
  product: {
    _id: string;
    title: string;
    sourceUrl: string;
    price: { amount: number };
    imageUrls: string[];
  };
  onCache: () => void;
}) {
  const slug = productSlugFromSourceUrl(product.sourceUrl);
  const image = product.imageUrls[0];

  return (
    <article className="group flex flex-col gap-3">
      <Link
        href={`/products/${slug}`}
        onClick={onCache}
        className="relative aspect-2/3 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100"
      >
        {image ? (
          <LazyImage
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="px-1">
        <Link
          href={`/products/${slug}`}
          onClick={onCache}
          className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:underline"
        >
          {product.title}
        </Link>
        <p className="mt-1 text-sm font-bold tabular-nums text-zinc-900">
          {formatUsd(product.price.amount)}
        </p>
      </div>
    </article>
  );
}

function OrderRelatedProducts({ order }: { order: Order }) {
  const { products, loading } = useOrderRelatedProducts(order);
  const { cacheProduct } = useProductCache();

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
          You may also like
        </h2>
        <p className="mt-6 text-sm text-zinc-500">Loading suggestions...</p>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
        You may also like
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <RelatedProductCard
            key={product._id}
            product={product}
            onCache={() => cacheProduct(product)}
          />
        ))}
      </div>
    </section>
  );
}

function OrderDetailLayout({ order }: { order: Order }) {
  return (
    <div className="space-y-5">
      <OrderShippingSection order={order} />
      <OrderInfoSection order={order} />
      <OrderContactSection />
      <OrderRelatedProducts order={order} />
    </div>
  );
}

export function OrdersView() {
  const searchParams = useSearchParams();
  const placedOrderCode = searchParams.get("placed");
  const codeParam = searchParams.get("code");
  const { isAuthenticated } = useAuth();
  const { orders: visibleOrders, isLoading: visibleLoading, error: visibleError } =
    useOrdersList();
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | null>(null);

  const activeOrderCode = useMemo(() => {
    if (selectedOrderCode) return selectedOrderCode;
    if (codeParam) return codeParam;
    if (placedOrderCode) return placedOrderCode;
    return visibleOrders[0]?.orderCode ?? null;
  }, [selectedOrderCode, codeParam, placedOrderCode, visibleOrders]);

  const activeOrder = useMemo(
    () =>
      visibleOrders.find((order) => order.orderCode === activeOrderCode) ??
      null,
    [visibleOrders, activeOrderCode],
  );

  return (
    <div className="-mx-4 -mt-9 bg-[#F5F5F5] sm:-mx-6 lg:-mx-8">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/account"
            className="text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ← Account
          </Link>
          <h1 className="mt-3 text-xl font-bold uppercase tracking-[0.15em] text-zinc-900 sm:text-2xl">
            Orders
          </h1>
        </div>

        {placedOrderCode ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Order placed successfully! Code:{" "}
            <span className="font-mono font-bold">{placedOrderCode}</span>
          </div>
        ) : null}

        {visibleLoading ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            Loading orders...
          </p>
        ) : !isAuthenticated ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-900">
              Please sign in
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Sign in to view your orders.
            </p>
            <Link
              href="/account/login"
              className="mt-8 inline-flex rounded-full bg-zinc-900 px-7 py-3 text-xs font-bold tracking-widest text-white transition-colors hover:bg-zinc-700"
            >
              SIGN IN
            </Link>
          </div>
        ) : visibleError ? (
          <p className="py-16 text-center text-sm text-red-600">{visibleError}</p>
        ) : visibleOrders.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          <>
            {visibleOrders.length > 1 ? (
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {visibleOrders.map((order) => {
                  const isActive = order.orderCode === activeOrderCode;
                  return (
                    <button
                      key={order._id}
                      type="button"
                      onClick={() => setSelectedOrderCode(order.orderCode)}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-2 font-mono text-xs font-bold transition-colors",
                        isActive
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
                      )}
                    >
                      {order.orderCode}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {activeOrder ? <OrderDetailLayout order={activeOrder} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
