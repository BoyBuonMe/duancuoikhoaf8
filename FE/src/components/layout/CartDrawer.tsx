"use client";

import Link from "next/link";
import { useState } from "react";
import { IconBag, IconClose, IconHeart, IconOrder } from "@/components/icons";
import { useAuth } from "@/features/auth";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/features/cart";
import type { CartItem } from "@/features/cart";
import { useCheckoutSlugFromCart } from "@/features/cart/hooks/useCheckoutSlugFromCart";
import { resolveCartItemProductHref } from "@/features/cart/lib/checkout-slug";
import { useAppSelector } from "@/store/hooks";
import {
  OrderStatusBadges,
  useOrdersList,
  type Order,
  type OrderItem,
} from "@/features/orders";
import { iconBlockClassName } from "@/lib/icon-block";
import { useHasHydrated } from "@/shared/hooks";
import { formatUsd } from "@/shared/lib/format-money";
import { cn } from "@/lib/utils";

type DrawerPanel = "bag" | "orders";

const ORDERS_HREF = "/account/orders";

function EmptyBagIllustration() {
  return (
    <div className="mx-auto flex size-30 items-center justify-center rounded-lg bg-zinc-700">
      <svg
        viewBox="0 0 60 60"
        fill="none"
        stroke="#9ca3af"
        strokeWidth={1.5}
        className="size-16"
        aria-hidden
      >
        <rect x="10" y="20" width="40" height="34" rx="2" />
        <path d="M22 20v-4a8 8 0 0 1 16 0v4" strokeLinecap="round" />
        <path
          d="M22 34c0 4.418 3.582 8 8 8s8-3.582 8-8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function CartLine({
  item,
  productHref,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  productHref: string | null;
  onRemove: (sku: string) => void;
  onUpdateQuantity: (sku: string, quantity: number) => void;
}) {
  const lineTotal = item.unitPrice.amount * item.quantity;
  const image = item.image ? (
    // Using a plain <img> here on purpose: cart line is a
    // throwaway thumbnail with no perf budget.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.image}
      alt={item.name}
      className="size-full object-cover"
      loading="lazy"
    />
  ) : null;

  return (
    <li className="flex gap-4 border-b border-zinc-800 px-5 py-4">
      {productHref ? (
        <SheetClose asChild>
          <Link
            href={productHref}
            className="size-20 shrink-0 overflow-hidden rounded bg-zinc-800"
            aria-label={`View ${item.name}`}
          >
            {image}
          </Link>
        </SheetClose>
      ) : (
        <div className="size-20 shrink-0 overflow-hidden rounded bg-zinc-800">
          {image}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {productHref ? (
              <SheetClose asChild>
                <Link href={productHref} className="block min-w-0">
                  <p className="truncate text-sm font-semibold text-white hover:underline">
                    {item.name}
                  </p>
                </Link>
              </SheetClose>
            ) : (
              <p className="truncate text-sm font-semibold text-white">
                {item.name}
              </p>
            )}
            <p className="text-xs text-zinc-400">{item.sku}</p>
            {item.variantLabel ? (
              <p className="text-xs text-zinc-400">{item.variantLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.sku)}
            className="text-xs text-zinc-400 underline-offset-2 hover:underline"
            aria-label={`Remove ${item.name}`}
          >
            Remove
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-zinc-700">
            <button
              type="button"
              onClick={() =>
                onUpdateQuantity(item.sku, Math.max(1, item.quantity - 1))
              }
              className="inline-flex size-7 items-center justify-center rounded-full text-white hover:bg-zinc-800"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              −
            </button>
            <span
              className="min-w-6 px-1 text-center text-sm tabular-nums text-white"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.sku, item.quantity + 1)}
              className="inline-flex size-7 items-center justify-center rounded-full text-white hover:bg-zinc-800"
              aria-label={`Increase quantity of ${item.name}`}
            >
              +
            </button>
          </div>
          <p className="text-sm font-semibold tabular-nums text-white">
            {formatUsd(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}

function OrderItemLine({
  item,
  orderCode,
}: {
  item: OrderItem;
  orderCode: string;
}) {
  const lineTotal = item.unitPrice.amount * item.quantity;
  const variantText = item.size || item.variantLabel || "";

  return (
    <li className="flex gap-4 border-b border-zinc-800 px-5 py-4">
      <SheetClose asChild>
        <Link
          href={ORDERS_HREF}
          className="size-20 shrink-0 overflow-hidden rounded bg-zinc-800"
          aria-label={`View order ${orderCode}`}
        >
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.name}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : null}
        </Link>
      </SheetClose>
      <div className="min-w-0 flex-1">
        <SheetClose asChild>
          <Link href={ORDERS_HREF} className="block min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {item.name}
            </p>
            <p className="text-xs text-zinc-400">{item.sku}</p>
            {variantText ? (
              <p className="text-xs text-zinc-400">{variantText}</p>
            ) : null}
            <p className="mt-1 text-xs text-zinc-500">Qty: {item.quantity}</p>
          </Link>
        </SheetClose>
        <div className="mt-2 flex items-center justify-end">
          <p className="text-sm font-semibold tabular-nums text-white">
            {formatUsd(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}

function OrderGroup({ order }: { order: Order }) {
  return (
    <li>
      <div className="flex items-center justify-between gap-3 border-b border-zinc-700 bg-zinc-800/60 px-5 py-3">
        <p className="font-mono text-xs font-bold tracking-wide text-white">
          {order.orderCode}
        </p>
        <OrderStatusBadges order={order} />
      </div>
      <ul>
        {order.items.map((item) => (
          <OrderItemLine
            key={`${order.orderCode}-${item.sku}`}
            item={item}
            orderCode={order.orderCode}
          />
        ))}
      </ul>
    </li>
  );
}

export function CartDrawer() {
  const hasHydrated = useHasHydrated();
  const { items, count, subtotal, removeItem, updateQuantity, clear } =
    useCart();
  const { isAuthenticated, sessionChecked } = useAuth();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<DrawerPanel>("bag");
  const {
    orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrdersList({ skip: !open || !isAuthenticated });

  // While the persisted store is still hydrating on the client, we
  // render the same "empty" UI the server emitted to avoid a flicker
  // and avoid a hydration mismatch warning.
  const visibleItems = hasHydrated ? items : [];
  const visibleCount = hasHydrated ? count : 0;
  const productsBySlug = useAppSelector((state) => state.products.bySlug);
  const {
    slugsParam: checkoutSlugsParam,
    isResolving: isResolvingCheckoutSlug,
  } = useCheckoutSlugFromCart(visibleItems);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setPanel("bag");
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            iconBlockClassName,
            "relative cursor-pointer rounded-full transition-all duration-150 hover:scale-105 hover:bg-store-ink-strong hover:text-store-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-store-ink/20 active:scale-95",
          )}
          aria-label={`Shopping cart${visibleCount > 0 ? `, ${visibleCount} items` : ""}`}
        >
          <IconBag className="size-5" />
          {visibleCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-store-accent text-[10px] font-semibold leading-none text-store-on-accent">
              {visibleCount > 9 ? "9+" : visibleCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 border-0 bg-zinc-900 p-0 text-white sm:max-w-125"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-zinc-700 px-5 py-4">
          <div>
            <SheetTitle className="text-sm font-bold uppercase tracking-widest text-white">
              {panel === "bag"
                ? `Your Bag${visibleCount > 0 ? ` (${visibleCount})` : ""}`
                : "Your Orders"}
            </SheetTitle>
            <SheetDescription className="sr-only">
              View and manage items in your shopping bag.
            </SheetDescription>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPanel("bag")}
              className={cn(
                "relative inline-flex size-9 items-center justify-center rounded-lg text-white",
                panel === "bag" ? "bg-black" : "hover:bg-zinc-800",
              )}
              aria-label="View bag"
            >
              <IconBag className="size-5" />
              {visibleCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-store-accent text-[10px] font-semibold leading-none text-store-on-accent">
                  {visibleCount > 9 ? "9+" : visibleCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setPanel("orders")}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-lg text-white",
                panel === "orders" ? "bg-black" : "hover:bg-zinc-800",
              )}
              aria-label="View orders"
            >
              <IconOrder className="size-5" />
            </button>
            <SheetClose className="inline-flex size-9 items-center justify-center rounded-full text-white hover:bg-zinc-800">
              <IconClose className="size-5" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        {panel === "bag" ? (
          visibleItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center">
              <EmptyBagIllustration />
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-widest text-white">
                  Your bag is empty
                </p>
                <p className="text-sm text-zinc-400">
                  There are no products in your bag
                </p>
              </div>
              <div className="mt-4 flex w-full flex-col gap-3">
                <SheetClose asChild>
                  <Link
                    href="/products"
                    className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-900"
                  >
                    Shop Now
                  </Link>
                </SheetClose>
              </div>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto">
                {visibleItems.map((item) => (
                  <CartLine
                    key={item.sku}
                    item={item}
                    productHref={resolveCartItemProductHref(
                      item,
                      productsBySlug,
                    )}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </ul>
              <div className="space-y-3 border-t border-zinc-700 px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-semibold text-white tabular-nums">
                    {formatUsd(subtotal.amount)}
                  </span>
                </div>
                <SheetClose asChild>
                  <Link
                    href={
                      checkoutSlugsParam
                        ? `/checkout?slug=${encodeURIComponent(checkoutSlugsParam)}`
                        : "#"
                    }
                    aria-disabled={
                      !checkoutSlugsParam || isResolvingCheckoutSlug
                    }
                    onClick={(event) => {
                      if (!checkoutSlugsParam || isResolvingCheckoutSlug) {
                        event.preventDefault();
                      }
                    }}
                    className={cn(
                      "flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-900",
                      (!checkoutSlugsParam || isResolvingCheckoutSlug) &&
                        "pointer-events-none opacity-50",
                    )}
                  >
                    {isResolvingCheckoutSlug ? "Loading..." : "Checkout"}
                  </Link>
                </SheetClose>
                <button
                  type="button"
                  onClick={clear}
                  className="block w-full text-center text-xs text-zinc-400 underline-offset-2 hover:underline"
                >
                  Clear bag
                </button>
              </div>
            </>
          )
        ) : !isAuthenticated && sessionChecked ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-white">
                Sign in to view orders
              </p>
              <p className="text-sm text-zinc-400">
                Log in to see your order history
              </p>
            </div>
            <SheetClose asChild>
              <Link
                href="/account/login"
                className="flex h-12 w-48 items-center justify-center rounded-full bg-black text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-900"
              >
                Log In
              </Link>
            </SheetClose>
          </div>
        ) : ordersLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-zinc-400">Loading orders...</p>
          </div>
        ) : ordersError ? (
          <div className="flex flex-1 items-center justify-center px-8 text-center">
            <p className="text-sm text-zinc-400">{ordersError}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-white">
                No orders yet
              </p>
              <p className="text-sm text-zinc-400">
                Your order history will appear here
              </p>
            </div>
            <SheetClose asChild>
              <Link
                href="/products"
                className="flex h-12 w-48 items-center justify-center rounded-full bg-black text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-900"
              >
                Shop Now
              </Link>
            </SheetClose>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto">
              {orders.map((order) => (
                <OrderGroup key={order._id} order={order} />
              ))}
            </ul>
            <div className="space-y-3 border-t border-zinc-700 px-5 py-4">
              <SheetClose asChild>
                <Link
                  href="/account/orders"
                  className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-900"
                >
                  View All Orders
                </Link>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
