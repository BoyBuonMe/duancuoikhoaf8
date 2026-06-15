"use client";

import { LazyImage } from "@/components/product/LazyImage";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/features/products/model/product.types";
import type { CartItem } from "@/features/cart/model/cart.types";
import { formatUsd } from "@/shared/lib/format-money";
import { resolveCheckoutSizeLabel } from "@/features/checkout/lib/resolve-checkout-size";

export interface CheckoutLineState {
  quantity: number;
  variantLabel: string;
  sku: string;
}

interface CheckoutProductCardProps {
  product: Product;
  cartItem?: CartItem;
  lineState: CheckoutLineState;
  onLineChange: (next: CheckoutLineState) => void;
}

export function CheckoutProductCard({
  product,
  cartItem,
  lineState,
  onLineChange,
}: CheckoutProductCardProps) {
  const { quantity } = lineState;
  const sku = cartItem?.sku ?? lineState.sku;
  const variantLabel = resolveCheckoutSizeLabel(
    product,
    sku,
    cartItem?.variantLabel ?? lineState.variantLabel,
  );
  const imageUrl = cartItem?.image ?? product.imageUrls[0] ?? "";
  const unitPrice = cartItem?.unitPrice.amount ?? product.price.amount;

  return (
    <section className="flex gap-5 rounded-2xl border border-store-border/60 bg-store-surface-2/40 p-5">
      <div className="relative aspect-2/3 w-28 shrink-0 overflow-hidden rounded-xl bg-store-surface sm:w-32">
        {imageUrl ? (
          <LazyImage
            key={imageUrl}
            src={imageUrl}
            alt={product.title}
            fill
            sizes="128px"
            className="object-cover transition-opacity duration-300"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          <h2 className="text-sm font-black uppercase leading-snug text-store-ink-strong">
            {product.title}
          </h2>
          <p className="mt-1 text-lg font-black text-store-ink-strong">
            {formatUsd(unitPrice)}
          </p>
        </div>

        {(product.sizes?.length ?? 0) > 0 || variantLabel ? (
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-store-ink-strong">
              Size
            </p>
            <p className="text-sm font-bold uppercase text-store-ink-strong">
              {variantLabel || "—"}
            </p>
          </div>
        ) : null}

        <div className="flex items-center gap-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-store-ink-strong">
            Quantity
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() =>
                onLineChange({
                  ...lineState,
                  quantity: Math.max(1, quantity - 1),
                })
              }
              className="flex size-9 items-center justify-center rounded-lg border border-store-border disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-bold">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() =>
                onLineChange({
                  ...lineState,
                  quantity: Math.min(99, quantity + 1),
                })
              }
              className="flex size-9 items-center justify-center rounded-lg border border-store-border"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function lineSubtotal(
  product: Product,
  quantity: number,
  cartItem?: CartItem,
): number {
  const unitPrice = cartItem?.unitPrice.amount ?? product.price.amount;
  return unitPrice * quantity;
}
