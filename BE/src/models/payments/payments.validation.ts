import { z } from "zod";
import { createOrderBodySchema } from "@/models/orders/orders.validation";

export const createMomoPaymentBodySchema = createOrderBodySchema.extend({
  paymentMethod: z.literal("momo"),
});

export const momoOrderIdParamsSchema = z.object({
  momoOrderId: z.string().trim().min(1),
});

export const createVnpayPaymentBodySchema = createOrderBodySchema.extend({
  paymentMethod: z.literal("vnpay"),
});

export const vnpTxnRefParamsSchema = z.object({
  vnpTxnRef: z.string().trim().min(1),
});
