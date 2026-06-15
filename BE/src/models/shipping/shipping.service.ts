import { httpError } from "@/utils/http-error";
import {
  HCMC_PROVINCE_CODE,
  SHIPPING_FEES,
  SHIPPING_ORIGIN,
} from "@/models/shipping/shipping.constants";
import { resolveDestinationCoordinates } from "@/models/shipping/geocoding.service";
import {
  distanceFromOriginKm,
  standardShippingFeeFromDistanceKm,
} from "@/models/shipping/shipping.utils";

export type ShippingCountry = "VN" | "INT";
export type DeliveryMethod = "standard" | "express";

export interface ShippingQuoteInput {
  country: ShippingCountry;
  deliveryMethod: DeliveryMethod;
  provinceCode?: string;
  provinceName?: string;
  wardName?: string;
  streetAddress?: string;
}

export interface ShippingQuoteResult {
  country: ShippingCountry;
  deliveryMethod: DeliveryMethod;
  distanceKm: number | null;
  distanceSource: "geocode" | "province" | "international" | null;
  standardFee: number;
  expressFee: number | null;
  expressAvailable: boolean;
  shippingFee: number;
  originLabel: string;
}

function isAddressComplete(input: ShippingQuoteInput): boolean {
  if (input.country === "INT") return true;
  return Boolean(input.provinceCode?.trim());
}

export async function quoteShipping(
  input: ShippingQuoteInput,
): Promise<ShippingQuoteResult> {
  if (!isAddressComplete(input)) {
    throw httpError("Please select a delivery address first", 400);
  }

  if (input.country === "INT") {
    if (input.deliveryMethod === "express") {
      throw httpError(
        "Express delivery is not available for international orders",
        400,
      );
    }
    const fee = SHIPPING_FEES.international;
    return {
      country: "INT",
      deliveryMethod: "standard",
      distanceKm: null,
      distanceSource: "international",
      standardFee: fee,
      expressFee: null,
      expressAvailable: false,
      shippingFee: fee,
      originLabel: SHIPPING_ORIGIN.label,
    };
  }

  const coords = await resolveDestinationCoordinates(input);
  const distanceKm = Math.round(distanceFromOriginKm(coords.lat, coords.lng));
  const standardFee = standardShippingFeeFromDistanceKm(distanceKm);
  const isHcmc = input.provinceCode?.trim() === HCMC_PROVINCE_CODE;
  const expressAvailable = isHcmc;
  const expressFee = expressAvailable ? SHIPPING_FEES.expressHcmc : null;

  if (input.deliveryMethod === "express") {
    if (!expressAvailable) {
      throw httpError(
        "Express delivery is only available within Ho Chi Minh City",
        400,
      );
    }
    return {
      country: "VN",
      deliveryMethod: "express",
      distanceKm,
      distanceSource: coords.source,
      standardFee,
      expressFee,
      expressAvailable,
      shippingFee: SHIPPING_FEES.expressHcmc,
      originLabel: SHIPPING_ORIGIN.label,
    };
  }

  return {
    country: "VN",
    deliveryMethod: "standard",
    distanceKm,
    distanceSource: coords.source,
    standardFee,
    expressFee,
    expressAvailable,
    shippingFee: standardFee,
    originLabel: SHIPPING_ORIGIN.label,
  };
}

export interface ShippingOptionsResult {
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

export async function quoteAllShippingOptions(
  input: Omit<ShippingQuoteInput, "deliveryMethod">,
): Promise<ShippingOptionsResult> {
  const standard = await quoteShipping({
    ...input,
    deliveryMethod: "standard",
  });

  let expressAvailable = standard.expressAvailable;
  let expressFee: number = SHIPPING_FEES.expressHcmc;

  if (input.country === "INT") {
    expressAvailable = false;
    expressFee = 0;
  }

  return {
    originLabel: standard.originLabel,
    country: standard.country,
    distanceKm: standard.distanceKm,
    distanceSource: standard.distanceSource,
    standard: {
      deliveryMethod: "standard",
      shippingFee: standard.shippingFee,
    },
    express: {
      deliveryMethod: "express",
      shippingFee: expressFee,
      available: expressAvailable,
    },
  };
}

export async function validateShippingForOrder(input: {
  country?: ShippingCountry;
  deliveryMethod: string;
  provinceCode?: string;
  provinceName?: string;
  wardName?: string;
  streetAddress?: string;
  shippingFee: number;
}) {
  const country: ShippingCountry = input.country === "INT" ? "INT" : "VN";
  const deliveryMethod: DeliveryMethod =
    input.deliveryMethod === "express" ? "express" : "standard";

  const quote = await quoteShipping({
    country,
    deliveryMethod,
    provinceCode: input.provinceCode,
    provinceName: input.provinceName,
    wardName: input.wardName,
    streetAddress: input.streetAddress,
  });

  if (country === "INT" && deliveryMethod === "express") {
    throw httpError("Express delivery is not available for international orders", 400);
  }

  if (Math.abs(quote.shippingFee - input.shippingFee) > 0.01) {
    throw httpError("Shipping fee does not match delivery address", 400);
  }

  return quote;
}
