import PendingVnpayPayment from "@/models/payments/PendingVnpayPayment.model";
import type { CreateOrderBody } from "@/models/orders/orders.validation";

const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

export async function createPendingVnpayPayment(data: {
  vnpTxnRef: string;
  userEmail: string;
  checkout: CreateOrderBody;
  amountVnd: number;
}) {
  return PendingVnpayPayment.create({
    ...data,
    status: "pending",
    expiresAt: new Date(Date.now() + PENDING_TTL_MS),
  });
}

export async function findPendingVnpayPaymentByTxnRef(vnpTxnRef: string) {
  return PendingVnpayPayment.findOne({
    vnpTxnRef: vnpTxnRef.toUpperCase(),
  }).lean();
}

export async function markPendingVnpayPaymentCompleted(
  vnpTxnRef: string,
  orderCode: string,
) {
  return PendingVnpayPayment.findOneAndUpdate(
    { vnpTxnRef: vnpTxnRef.toUpperCase(), status: "pending" },
    { $set: { status: "completed", orderCode: orderCode.toUpperCase() } },
    { new: true },
  ).lean();
}
