import { httpClient } from "@/utils/http";

export type ShippingCountry = "VN" | "INT";
export type DeliveryMethod = "standard" | "express";

export interface ShippingOptions {
  originLabel: string;
  country: ShippingCountry;
  distanceKm: number | null;
  distanceSource: "geocode" | "province" | "international" | null;
  standard: {
    deliveryMethod: "standard";
    shippingFee: number;
  };
  express: {
    deliveryMethod: "express";
    shippingFee: number;
    available: boolean;
  };
}

export interface ShippingAddressInput {
  country: ShippingCountry;
  provinceCode?: string;
  provinceName?: string;
  wardCode?: string;
  wardName?: string;
  streetAddress?: string;
}

export async function fetchShippingOptionsApi(
  payload: ShippingAddressInput,
): Promise<{ options: ShippingOptions }> {
  const { data } = await httpClient.post<{ options: ShippingOptions }>(
    "/shipping/quote",
    payload,
  );
  return data;
}
