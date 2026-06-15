"use client";

import { useEffect, useState } from "react";
import {
  fetchShippingOptionsApi,
  type ShippingCountry,
  type ShippingOptions,
} from "@/features/shipping/api/shipping.api";

interface UseShippingOptionsInput {
  country: ShippingCountry;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  streetAddress: string;
}

interface ShippingOptionsState {
  options: ShippingOptions | null;
  error: string | null;
  resolvedKey: string;
}

const EMPTY: ShippingOptionsState = {
  options: null,
  error: null,
  resolvedKey: "",
};

function buildRequestKey(input: UseShippingOptionsInput): string | null {
  if (input.country === "INT") {
    return "INT";
  }
  if (!input.provinceCode) return null;
  return [
    input.country,
    input.provinceCode,
    input.wardCode,
    input.streetAddress.trim(),
  ].join("|");
}

export function useShippingOptions(input: UseShippingOptionsInput) {
  const [data, setData] = useState<ShippingOptionsState>(EMPTY);
  const requestKey = buildRequestKey(input);

  useEffect(() => {
    if (!requestKey) {
      setData(EMPTY);
      return;
    }

    let cancelled = false;

    fetchShippingOptionsApi({
      country: input.country,
      provinceCode: input.provinceCode || undefined,
      provinceName: input.provinceName || undefined,
      wardCode: input.wardCode || undefined,
      wardName: input.wardName || undefined,
      streetAddress: input.streetAddress.trim() || undefined,
    })
      .then((response) => {
        if (cancelled) return;
        setData({
          options: response.options,
          error: null,
          resolvedKey: requestKey,
        });
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        if (cancelled) return;
        setData({
          options: null,
          error:
            err.response?.data?.message ??
            "Could not calculate shipping fee.",
          resolvedKey: requestKey,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    requestKey,
    input.country,
    input.provinceCode,
    input.provinceName,
    input.wardCode,
    input.wardName,
    input.streetAddress,
  ]);

  const isResolved = data.resolvedKey === requestKey;
  const loading = Boolean(requestKey) && !isResolved;
  const options = requestKey && isResolved ? data.options : null;
  const error = requestKey && isResolved ? data.error : null;

  return { options, loading, error, isReady: Boolean(requestKey) };
}
