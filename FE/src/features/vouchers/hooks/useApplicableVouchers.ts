"use client";

import { useEffect, useState } from "react";
import {
  fetchApplicableVouchersApi,
  type Voucher,
} from "@/features/vouchers";

interface VoucherFetchState {
  vouchers: Voucher[];
  error: string | null;
  resolvedKey: string;
}

const EMPTY_STATE: VoucherFetchState = {
  vouchers: [],
  error: null,
  resolvedKey: "",
};

export function useApplicableVouchers(
  productIds: string[],
  subtotal: number,
) {
  const [data, setData] = useState<VoucherFetchState>(EMPTY_STATE);
  const productKey = productIds.join(",");
  const stableSubtotal = Math.round(subtotal * 100) / 100;
  const requestKey =
    productIds.length > 0 ? `${productKey}|${stableSubtotal}` : "";

  useEffect(() => {
    if (!requestKey) return;

    let cancelled = false;

    fetchApplicableVouchersApi(productIds, stableSubtotal)
      .then((response) => {
        if (cancelled) return;
        setData({
          vouchers: response.vouchers,
          error: null,
          resolvedKey: requestKey,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setData({
          vouchers: [],
          error: null,
          resolvedKey: requestKey,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, productIds, stableSubtotal]);

  const isResolved = data.resolvedKey === requestKey;
  const loading = Boolean(requestKey) && !isResolved;
  const vouchers = requestKey && isResolved ? data.vouchers : [];
  const error = requestKey && isResolved ? data.error : null;

  return { vouchers, loading, error };
}
