"use client";

import Image from "next/image";
import Link from "next/link";
import type { MomoPaymentSession } from "@/features/payments/api/momo.api";
import { formatUsd } from "@/shared/lib/format-money";

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface MomoPaymentPanelProps {
  payment: MomoPaymentSession;
}

export function MomoPaymentPanel({ payment }: MomoPaymentPanelProps) {
  const qrSource =
    payment.qrCodeUrl ??
    (payment.payUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(payment.payUrl)}`
      : null);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-store-border bg-white p-6 text-center shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-store-ink-strong">
        Pay with MoMo
      </p>
      <p className="mt-2 text-sm text-store-fg-muted">
        Order{" "}
        <span className="font-mono font-semibold text-store-ink-strong">
          {payment.momoOrderId}
        </span>
      </p>

      <div className="mt-6 space-y-1">
        <p className="text-2xl font-black text-store-ink-strong">
          {formatVnd(payment.amountVnd)}
        </p>
        <p className="text-sm text-store-fg-muted">
          ≈ {formatUsd(payment.amountUsd)} {payment.currency}
        </p>
      </div>

      {qrSource ? (
        <div className="mx-auto mt-6 flex size-60 items-center justify-center rounded-xl border border-store-border bg-white p-3">
          <Image
            src={qrSource}
            alt="MoMo payment QR code"
            width={220}
            height={220}
            unoptimized
            className="size-[220px] object-contain"
          />
        </div>
      ) : null}

      <p className="mt-4 text-sm text-store-fg-muted">
        Scan the QR code with the MoMo app to complete your payment.
      </p>

      {payment.payUrl ? (
        <Link
          href={payment.payUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg bg-[#a50064] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-opacity hover:opacity-80"
        >
          Open MoMo payment
        </Link>
      ) : null}
    </div>
  );
}
