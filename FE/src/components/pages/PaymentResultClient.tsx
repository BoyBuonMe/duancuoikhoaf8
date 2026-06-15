"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatUsd } from "@/shared/lib/format-money";
import { useToast } from "@/shared/context/ToastContext";

const REDIRECT_SECONDS = 5;

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseAmount(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function PaymentResultClient() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const amountVnd = parseAmount(searchParams.get("amountVnd"));
  const amountUsd = parseAmount(searchParams.get("amountUsd"));
  const orderCode = searchParams.get("orderCode");

  const isSuccess = status === "success";
  const isFailed = status === "failed";
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const { success, error } = useToast();
  const toastShownRef = useRef(false);

  const accountHref = orderCode
    ? `/account?placed=${encodeURIComponent(orderCode)}&scroll=orders`
    : "/account?scroll=orders";

  useEffect(() => {
    if (toastShownRef.current) return;
    if (isSuccess) {
      toastShownRef.current = true;
      success("Payment processed successfully!");
    } else if (isFailed) {
      toastShownRef.current = true;
      error("Payment transaction failed.");
    }
  }, [isSuccess, isFailed, success, error]);

  useEffect(() => {
    if (!isSuccess && !isFailed) return;

    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    const redirectTimer = window.setTimeout(() => {
      window.location.assign(accountHref);
    }, REDIRECT_SECONDS * 1000);

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [accountHref, isFailed, isSuccess]);

  if (!isSuccess && !isFailed) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-store-fg-muted">
          We could not determine your payment result.
        </p>
        <Link
          href="/account?scroll=orders"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-store-ink-strong px-8 text-sm font-semibold text-white transition hover:opacity-90"
        >
          View my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <div
        className={`flex size-20 items-center justify-center rounded-full ${
          isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
        }`}
        aria-hidden
      >
        {isSuccess ? (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <h1 className="mt-6 text-2xl font-black uppercase tracking-wide text-store-ink-strong">
        {isSuccess ? "Payment Successful" : "Payment Failed"}
      </h1>

      <p className="mt-2 text-sm text-store-fg-muted">
        {isSuccess
          ? "Your VNPay payment has been processed."
          : "Your VNPay payment could not be completed."}
      </p>

      {amountVnd !== null && (
        <div className="mt-8 space-y-1">
          <p className="text-3xl font-black text-store-ink-strong">
            {formatVnd(amountVnd)}
          </p>
          {amountUsd !== null && (
            <p className="text-sm text-store-fg-muted">≈ {formatUsd(amountUsd)} USD</p>
          )}
        </div>
      )}

      <Link
        href={accountHref}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-store-ink-strong px-8 text-sm font-semibold text-white transition hover:opacity-90"
      >
        View my orders
      </Link>

      <p className="mt-4 text-xs text-store-fg-muted">
        Redirecting to your orders in {secondsLeft}s...
      </p>
    </div>
  );
}
