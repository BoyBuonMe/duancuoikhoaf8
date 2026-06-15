import type { CreateOrderPayload } from "@/features/orders/api/orders.api";
import { httpClient } from "@/utils/http";

export interface MomoPaymentSession {
  momoOrderId: string;
  amountVnd: number;
  amountUsd: number;
  currency: string;
  payUrl: string | null;
  qrCodeUrl: string | null;
  deeplink: string | null;
  requestId: string;
}

export async function createMomoPaymentApi(
  payload: CreateOrderPayload,
): Promise<{ payment: MomoPaymentSession }> {
  const { data } = await httpClient.post<{ payment: MomoPaymentSession }>(
    "/payments/momo/create",
    payload,
  );
  return data;
}
