import type { CreateOrderPayload, Order } from "@/features/orders/api/orders.api";
import { httpClient } from "@/utils/http";

export interface VnpayPaymentSession {
  vnpTxnRef: string;
  amountVnd: number;
  amountUsd: number;
  currency: string;
  payUrl: string;
}

export type VnpayPaymentResult =
  | { status: "pending"; order: null }
  | { status: "completed"; order: Order };

export async function createVnpayPaymentApi(
  payload: CreateOrderPayload,
): Promise<{ payment: VnpayPaymentSession }> {
  const { data } = await httpClient.post<{ payment: VnpayPaymentSession }>(
    "/payments/vnpay/create",
    payload,
  );
  return data;
}

export async function getVnpayPaymentResultApi(
  vnpTxnRef: string,
): Promise<VnpayPaymentResult> {
  const { data } = await httpClient.get<VnpayPaymentResult>(
    `/payments/vnpay/result/${encodeURIComponent(vnpTxnRef)}`,
  );
  return data;
}
