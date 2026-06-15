"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import {
  CheckoutProductCard,
  lineSubtotal,
  type CheckoutLineState,
} from "@/components/pages/CheckoutProductCard";
import {
  buildOrderItemsFromCheckout,
  matchCartItemForProduct,
} from "@/features/checkout/lib/build-order-items";
import { resolveCheckoutSizeLabel } from "@/features/checkout/lib/resolve-checkout-size";
import {
  consumeCheckoutReturnReload,
  markCheckoutPaymentRedirect,
} from "@/features/checkout/lib/checkout-payment-redirect";
import { useCheckoutProducts } from "@/features/checkout/hooks/useCheckoutProducts";
import { useAuth } from "@/features/auth";
import { useCart } from "@/features/cart";
import { syncCartAfterOrder } from "@/features/cart/lib/sync-cart-after-order";
import { useAppDispatch } from "@/store/hooks";
import { useCreateOrderMutation } from "@/features/orders";
import { createMomoPaymentApi } from "@/features/payments/api/momo.api";
import { createVnpayPaymentApi } from "@/features/payments/api/vnpay.api";
import { useApplicableVouchers } from "@/features/vouchers/hooks/useApplicableVouchers";
import {
  applyDiscountCodeApi,
  type AppliedDiscountCode,
} from "@/features/discount-codes/api/discount-codes.api";
import {
  getWardsByProvince,
  provinces,
  type Ward,
} from "@/lib/vietnam-address";
import { useShippingOptions } from "@/features/shipping/hooks/useShippingOptions";
import type { ShippingCountry } from "@/features/shipping/api/shipping.api";
import { formatUsd } from "@/shared/lib/format-money";

type DeliveryMethod = "standard" | "express";

const DELIVERY_METHODS: Array<{
  id: DeliveryMethod;
  label: string;
  description: string;
}> = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "Based on distance from our Thu Duc hub",
  },
  {
    id: "express",
    label: "Express delivery",
    description: "HCMC only · same-day priority",
  },
];

const PAYMENT_METHODS = [
  { id: "vnpay", label: "VNPay" },
  { id: "bank", label: "Bank transfer" },
  { id: "momo", label: "MoMo" },
  { id: "cod", label: "Cash on delivery" },
] as const;

interface CheckoutViewProps {
  slug?: string;
}

const EMPTY_LINE_STATE: CheckoutLineState = {
  quantity: 1,
  variantLabel: "",
  sku: "",
};

export function CheckoutView({ slug }: CheckoutViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { items: cartItems, isLoading: cartLoading } = useCart();
  const [createOrder] = useCreateOrderMutation();
  const { slugs, products, loading, failedSlugs, isReady } =
    useCheckoutProducts(slug);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
  const [deliveryId, setDeliveryId] = useState<DeliveryMethod>("standard");
  const [shippingCountry, setShippingCountry] = useState<ShippingCountry>("VN");
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [selectedVoucherCode, setSelectedVoucherCode] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedDiscountCode | null>(
    null,
  );
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_METHODS)[number]["id"]>("vnpay");

  const [quantityOverrides, setQuantityOverrides] = useState<{
    key: string;
    values: Record<string, number>;
  }>({ key: "", values: {} });

  useEffect(() => {
    if (consumeCheckoutReturnReload()) {
      window.location.reload();
      return;
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setIsPlacingOrder(false);
      setPlaceOrderError(null);
      window.location.reload();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const productKey = useMemo(
    () => products.map((product) => product._id).join("|"),
    [products],
  );

  const cartKey = useMemo(
    () =>
      cartItems
        .map((item) => `${item.sku}:${item.quantity}:${item.variantLabel ?? ""}`)
        .join("|"),
    [cartItems],
  );

  const checkoutLinesKey =
    isReady && !cartLoading && productKey ? `${productKey}::${cartKey}` : "";

  const baseLineStates = useMemo((): CheckoutLineState[] => {
    if (!checkoutLinesKey) return [];

    return products.map((product) => {
      const cartItem = matchCartItemForProduct(product, cartItems);
      const sku = cartItem?.sku ?? "";
      return {
        quantity: cartItem?.quantity ?? 1,
        variantLabel: resolveCheckoutSizeLabel(
          product,
          sku,
          cartItem?.variantLabel,
        ),
        sku,
      };
    });
  }, [checkoutLinesKey, products, cartItems]);

  const lineStates = useMemo(() => {
    const overrides =
      quantityOverrides.key === checkoutLinesKey
        ? quantityOverrides.values
        : {};

    return baseLineStates.map((line, index) => {
      const productId = products[index]?._id;
      const overrideQty = productId ? overrides[productId] : undefined;
      return overrideQty != null ? { ...line, quantity: overrideQty } : line;
    });
  }, [baseLineStates, checkoutLinesKey, products, quantityOverrides]);

  const provinceOptions = useMemo(
    () => provinces.map((p) => ({ value: p.code, label: p.name })),
    [],
  );

  const wardOptions = useMemo(() => {
    if (!provinceCode) return [];
    return getWardsByProvince(provinceCode).map((w: Ward) => ({
      value: w.code,
      label: w.name,
    }));
  }, [provinceCode]);

  const provinceName = useMemo(
    () => provinces.find((p) => p.code === provinceCode)?.name ?? "",
    [provinceCode],
  );

  const wardName = useMemo(
    () => wardOptions.find((w) => w.value === wardCode)?.label ?? "",
    [wardOptions, wardCode],
  );

  const {
    options: shippingOptions,
    loading: shippingLoading,
    error: shippingError,
    isReady: shippingReady,
  } = useShippingOptions({
    country: shippingCountry,
    provinceCode,
    provinceName,
    wardCode,
    wardName,
    streetAddress,
  });

  const resolvedDeliveryId = useMemo((): DeliveryMethod => {
    if (
      deliveryId === "express" &&
      shippingOptions &&
      !shippingOptions.express.available
    ) {
      return "standard";
    }
    return deliveryId;
  }, [deliveryId, shippingOptions]);

  const subtotal = useMemo(() => {
    return products.reduce((sum, product, index) => {
      const line = lineStates[index] ?? EMPTY_LINE_STATE;
      const cartItem = matchCartItemForProduct(product, cartItems);
      return sum + lineSubtotal(product, line.quantity, cartItem);
    }, 0);
  }, [products, lineStates, cartItems]);

  const productIds = useMemo(
    () => products.map((product) => product._id),
    [products],
  );

  const {
    vouchers: applicableVouchers,
    loading: vouchersLoading,
  } = useApplicableVouchers(productIds, subtotal);

  const voucherCode = useMemo(() => {
    if (
      selectedVoucherCode &&
      applicableVouchers.some((voucher) => voucher.code === selectedVoucherCode)
    ) {
      return selectedVoucherCode;
    }
    return "";
  }, [applicableVouchers, selectedVoucherCode]);

  const shippingFee =
    resolvedDeliveryId === "express"
      ? (shippingOptions?.express.shippingFee ?? 0)
      : (shippingOptions?.standard.shippingFee ?? 0);

  const selectedVoucher = applicableVouchers.find(
    (voucher) => voucher.code === voucherCode,
  );

  const voucherDiscount = selectedVoucher
    ? Math.round((subtotal * selectedVoucher.discountValue) / 100)
    : 0;

  const promoDiscount = appliedPromo
    ? Math.round((subtotal * appliedPromo.discountValue) / 100)
    : 0;

  const totalDiscount = voucherDiscount + promoDiscount;
  const total = Math.max(0, subtotal - totalDiscount) + shippingFee;

  const voucherOptions = useMemo(() => {
    if (vouchersLoading) return [];

    if (applicableVouchers.length === 0) {
      return [
        {
          value: "__none__",
          label: "No vouchers apply",
          disabled: true,
        },
      ];
    }

    return [
      {
        value: "__none__",
        label: "No voucher",
      },
      ...applicableVouchers.map((voucher) => ({
        value: voucher.code,
        label: `${voucher.label} (${voucher.discountValue}% off)`,
      })),
    ];
  }, [applicableVouchers, vouchersLoading]);

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) {
      setPromoError("Please enter a discount code.");
      setAppliedPromo(null);
      return;
    }

    setPromoError(null);
    setIsApplyingPromo(true);
    try {
      const { discountCode } = await applyDiscountCodeApi(code, subtotal);
      setAppliedPromo(discountCode);
    } catch {
      setAppliedPromo(null);
      setPromoError("Discount code is invalid or expired.");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  async function handlePlaceOrder() {
    if (!isAuthenticated) {
      router.push("/account/login");
      return;
    }

    setPlaceOrderError(null);

    if (!shippingReady || !shippingOptions) {
      setPlaceOrderError("Please select a delivery address to calculate shipping.");
      return;
    }

    if (resolvedDeliveryId === "express" && !shippingOptions.express.available) {
      setPlaceOrderError("Express delivery is not available for this address.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderItems = buildOrderItemsFromCheckout(
        products,
        lineStates,
        cartItems,
      );
      const checkoutPayload = {
        items: orderItems,
        deliveryMethod: resolvedDeliveryId,
        paymentMethod,
        shippingCountry,
        provinceName: provinceName || undefined,
        wardName: wardName || undefined,
        provinceCode: provinceCode || undefined,
        wardCode: wardCode || undefined,
        streetAddress: streetAddress.trim() || undefined,
        subtotal: { amount: subtotal, currency: "USD" },
        shippingFee,
        voucherCode: selectedVoucher?.code,
        voucherDiscount,
        promoCode: appliedPromo?.code,
        promoDiscount,
        total: { amount: total, currency: "USD" },
      } as const;

      if (paymentMethod === "momo") {
        const { payment } = await createMomoPaymentApi({
          ...checkoutPayload,
          paymentMethod: "momo",
        });
        if (!payment.payUrl) {
          setPlaceOrderError("MoMo did not return a payment URL. Please try again.");
          return;
        }
        setIsPlacingOrder(false);
        markCheckoutPaymentRedirect();
        window.location.assign(payment.payUrl);
        return;
      }

      if (paymentMethod === "vnpay") {
        const { payment } = await createVnpayPaymentApi({
          ...checkoutPayload,
          paymentMethod: "vnpay",
        });
        if (!payment.payUrl) {
          setPlaceOrderError("VNPay did not return a payment URL. Please try again.");
          return;
        }
        setIsPlacingOrder(false);
        markCheckoutPaymentRedirect();
        window.location.assign(payment.payUrl);
        return;
      }

      const order = await createOrder(checkoutPayload).unwrap();
      syncCartAfterOrder(dispatch);

      router.push(
        `/account?placed=${encodeURIComponent(order.orderCode)}&scroll=orders`,
      );
    } catch {
      setPlaceOrderError("Could not place your order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (!slug || slugs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-base font-bold uppercase tracking-wider text-store-ink-strong">
          No products to checkout
        </p>
        <Link
          href="/wishlist"
          className="rounded-lg bg-store-ink-strong px-6 py-2.5 text-xs font-black uppercase tracking-wider text-store-paper"
        >
          Back to wishlist
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-base font-bold uppercase tracking-wider text-store-ink-strong">
          Loading products...
        </p>
      </div>
    );
  }

  if (!isReady || products.length !== slugs.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-base font-bold uppercase tracking-wider text-store-ink-strong">
          Could not load product details
        </p>
        <p className="max-w-sm text-sm text-store-fg-muted">
          No product found for slug:{" "}
          {failedSlugs.length > 0 ? failedSlugs.join(", ") : slugs.join(", ")}
        </p>
        <Link
          href="/products"
          className="rounded-lg bg-store-ink-strong px-6 py-2.5 text-xs font-black uppercase tracking-wider text-store-paper"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-9 w-[calc(100%+2rem)] bg-store-paper sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-black uppercase tracking-tight text-store-ink-strong">
          Checkout
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-8">
            {products.map((product, index) => {
              const cartItem = matchCartItemForProduct(product, cartItems);
              return (
                <CheckoutProductCard
                  key={`${product._id}-${index}`}
                  product={product}
                  cartItem={cartItem}
                  lineState={lineStates[index] ?? EMPTY_LINE_STATE}
                  onLineChange={(next) => {
                    const productId = product._id;
                    setQuantityOverrides((current) => ({
                      key: checkoutLinesKey,
                      values: {
                        ...(current.key === checkoutLinesKey
                          ? current.values
                          : {}),
                        [productId]: next.quantity,
                      },
                    }));
                  }}
                />
              );
            })}

            <section className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-store-ink-strong">
                Delivery address
              </p>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "VN" as const, label: "Vietnam" },
                    { id: "INT" as const, label: "International" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setShippingCountry(opt.id);
                      if (opt.id === "INT") {
                        setProvinceCode("");
                        setWardCode("");
                      }
                    }}
                    className={`rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                      shippingCountry === opt.id
                        ? "border-store-ink-strong bg-store-ink-strong text-store-paper"
                        : "border-store-border hover:border-store-ink-strong/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {shippingCountry === "VN" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SearchableSelect
                    label="Province / City"
                    placeholder="Search province..."
                    options={provinceOptions}
                    value={provinceCode}
                    onChange={(code) => {
                      setProvinceCode(code);
                      setWardCode("");
                    }}
                  />
                  <SearchableSelect
                    label="Ward"
                    placeholder={
                      provinceCode ? "Search ward..." : "Select a province first"
                    }
                    options={wardOptions}
                    value={wardCode}
                    onChange={setWardCode}
                    disabled={!provinceCode}
                  />
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label
                      htmlFor="street-address"
                      className="text-[11px] font-black uppercase tracking-widest text-store-ink-strong"
                    >
                      Street address
                    </label>
                    <input
                      id="street-address"
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House number, street name"
                      className="h-11 w-full rounded-lg border border-store-border bg-store-paper px-3 text-sm outline-none focus:border-store-ink-strong"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-store-fg-muted">
                  International shipping flat rate applies. Enter any notes in street
                  address if needed.
                </p>
              )}

              {shippingCountry === "INT" ? (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="intl-notes"
                    className="text-[11px] font-black uppercase tracking-widest text-store-ink-strong"
                  >
                    Delivery notes
                  </label>
                  <input
                    id="intl-notes"
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Country, city, postal code..."
                    className="h-11 w-full rounded-lg border border-store-border bg-store-paper px-3 text-sm outline-none focus:border-store-ink-strong"
                  />
                </div>
              ) : null}

              {shippingLoading ? (
                <p className="text-sm text-store-fg-muted">
                  Calculating distance from Ngã Tư Thủ Đức...
                </p>
              ) : null}
              {shippingError ? (
                <p className="text-sm text-destructive">{shippingError}</p>
              ) : null}
              {shippingOptions?.distanceKm != null ? (
                <p className="text-xs text-store-fg-muted">
                  ~{shippingOptions.distanceKm} km from {shippingOptions.originLabel}
                  {shippingOptions.distanceSource === "geocode"
                    ? " (estimated from address)"
                    : " (estimated from province)"}
                </p>
              ) : null}
            </section>

            <section className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-store-ink-strong">
                Delivery method
              </p>
              {!shippingReady ? (
                <p className="text-sm text-store-fg-muted">
                  Select a delivery address to see shipping options.
                </p>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  {DELIVERY_METHODS.map((opt) => {
                    const fee =
                      opt.id === "express"
                        ? shippingOptions?.express.shippingFee
                        : shippingOptions?.standard.shippingFee;
                    const disabled =
                      opt.id === "express" && !shippingOptions?.express.available;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setDeliveryId(opt.id)}
                        className={`flex flex-1 flex-col rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                          resolvedDeliveryId === opt.id
                            ? "border-store-ink-strong bg-store-surface"
                            : "border-store-border hover:border-store-ink-strong/50"
                        }`}
                      >
                        <span className="text-sm font-bold text-store-ink-strong">
                          {opt.label}
                        </span>
                        <span className="mt-1 text-xs text-store-fg-muted">
                          {opt.description}
                        </span>
                        <span className="mt-2 text-sm font-black text-store-ink-strong">
                          {fee != null ? formatUsd(fee) : "—"}
                        </span>
                        {disabled ? (
                          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-store-fg-muted">
                            HCMC only
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-store-border/60 bg-store-surface-2/40 p-5">
              <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-store-ink-strong">
                Discount vouchers
              </p>
              <Select
                placeholder="Select voucher"
                options={voucherOptions}
                value={voucherCode || "__none__"}
                disabled={vouchersLoading}
                onChange={(code) => {
                  setSelectedVoucherCode(code === "__none__" ? "" : code);
                }}
              />
            </section>

            <section className="rounded-2xl border border-store-border/60 bg-store-surface-2/40 p-5">
              <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-store-ink-strong">
                Discount code
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    if (promoError) setPromoError(null);
                  }}
                  placeholder="Discount code"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-store-border bg-store-paper px-3 text-sm outline-none focus:border-store-ink-strong"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo}
                  className="h-11 shrink-0 rounded-lg bg-store-ink-strong px-5 text-xs font-black uppercase tracking-wider text-store-paper transition-colors hover:opacity-80 disabled:opacity-60"
                >
                  {isApplyingPromo ? "Applying..." : "Apply"}
                </button>
              </div>
              {promoError ? (
                <p className="mt-2 text-sm text-destructive">{promoError}</p>
              ) : null}
              {appliedPromo ? (
                <p className="mt-2 text-sm font-medium text-green-700">
                  Applied {appliedPromo.label} (-{appliedPromo.discountValue}%)
                </p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-store-border/60 bg-store-surface-2/40 p-5">
              <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-store-ink-strong">
                Payment method
              </p>
              <div className="flex flex-col gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      paymentMethod === method.id
                        ? "border-store-ink-strong bg-store-surface"
                        : "border-store-border hover:border-store-ink-strong/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="accent-store-ink"
                    />
                    <span className="font-medium text-store-ink-strong">
                      {method.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-store-border bg-store-paper p-5 shadow-sm">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-store-fg-muted">
                  <span>Subtotal ({products.length} items)</span>
                  <span>{formatUsd(subtotal)}</span>
                </div>
                <div className="flex justify-between text-store-fg-muted">
                  <span>Shipping</span>
                  <span>
                    {shippingReady && shippingOptions
                      ? formatUsd(shippingFee)
                      : "—"}
                  </span>
                </div>
                {voucherDiscount > 0 ? (
                  <div className="flex justify-between text-green-700">
                    <span>
                      Voucher discount
                      {selectedVoucher ? ` (${selectedVoucher.code})` : ""}
                    </span>
                    <span>-{formatUsd(voucherDiscount)}</span>
                  </div>
                ) : null}
                {promoDiscount > 0 ? (
                  <div className="flex justify-between text-green-700">
                    <span>
                      Code discount
                      {appliedPromo ? ` (${appliedPromo.code})` : ""}
                    </span>
                    <span>-{formatUsd(promoDiscount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-store-border pt-3 text-base font-black text-store-ink-strong">
                  <span>Total</span>
                  <span>{formatUsd(total)}</span>
                </div>
              </div>

              {placeOrderError ? (
                <p className="mt-3 text-center text-sm text-destructive">
                  {placeOrderError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !shippingReady || !shippingOptions}
                className="mt-5 w-full cursor-pointer rounded-lg bg-store-ink-strong py-4 text-xs font-black uppercase tracking-[0.2em] text-store-paper transition-colors hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPlacingOrder ? "Placing order..." : "Place order"}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
