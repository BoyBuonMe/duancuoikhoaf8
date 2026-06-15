import PendingMomoPayment from "@/models/payments/PendingMomoPayment.model";
import type { CreateOrderBody } from "@/models/orders/orders.validation";

const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

export async function createPendingMomoPayment(data: {
  momoOrderId: string;
  userEmail: string;
  checkout: CreateOrderBody;
}) {
  return PendingMomoPayment.create({
    ...data,
    status: "pending",
    expiresAt: new Date(Date.now() + PENDING_TTL_MS),
  });
}

export async function findPendingMomoPaymentByOrderId(momoOrderId: string) {
  return PendingMomoPayment.findOne({
    momoOrderId: momoOrderId.toUpperCase(),
  }).lean();
}

export async function markPendingMomoPaymentCompleted(
  momoOrderId: string,
  orderCode: string,
) {
  return PendingMomoPayment.findOneAndUpdate(
    { momoOrderId: momoOrderId.toUpperCase(), status: "pending" },
    { $set: { status: "completed", orderCode: orderCode.toUpperCase() } },
    { new: true },
  ).lean();
}
