import { z } from "zod";
import { ORDER_STATUSES } from "@/models/orders/Order.model";

const moneySchema = z.object({
  amount: z.number().min(0),
  currency: z.string().trim().min(1).default("USD"),
});

const orderItemSchema = z.object({
  productId: z.string().trim().optional(),
  productSlug: z.string().trim().optional(),
  sku: z.string().trim().min(1),
  name: z.string().trim().min(1),
  image: z.string().trim().min(1),
  variantLabel: z.string().trim().optional(),
  color: z.string().trim().optional(),
  size: z.string().trim().optional(),
  quantity: z.number().int().min(1),
  unitPrice: moneySchema,
});

export const createOrderBodySchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  deliveryMethod: z.string().trim().min(1),
  paymentMethod: z.string().trim().min(1),
  provinceCode: z.string().trim().optional(),
  wardCode: z.string().trim().optional(),
  streetAddress: z.string().trim().optional(),
  shippingCountry: z.enum(["VN", "INT"]).optional().default("VN"),
  provinceName: z.string().trim().optional(),
  wardName: z.string().trim().optional(),
  subtotal: moneySchema,
  shippingFee: z.number().min(0),
  voucherCode: z.string().trim().optional(),
  voucherDiscount: z.number().min(0).default(0),
  promoCode: z.string().trim().optional(),
  promoDiscount: z.number().min(0).default(0),
  total: moneySchema,
});

export const orderCodeParamsSchema = z.object({
  orderCode: z.string().trim().min(1),
});

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type OrderCodeParams = z.infer<typeof orderCodeParamsSchema>;

export { ORDER_STATUSES };
