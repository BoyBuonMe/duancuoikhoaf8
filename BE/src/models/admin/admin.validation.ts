import { z } from "zod";
import { ORDER_STATUSES } from "@/models/orders/Order.model";

const objectIdSchema = z.object({
  id: z.string().trim().min(1),
});

const optionalBooleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const adminIdParamsSchema = objectIdSchema;

export const adminListUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["user", "admin", "boss"]).optional(),
  status: z.enum(["active", "blocked"]).optional(),
  emailVerified: optionalBooleanQuery,
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
});

export const adminUpdateUserBodySchema = z
  .object({
    name: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(32).optional(),
    role: z.enum(["user", "admin", "boss"]).optional(),
    status: z.enum(["active", "blocked"]).optional(),
    emailVerified: z.boolean().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  });

const priceSchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().trim().min(1).max(8).toUpperCase(),
});

export const adminListProductsQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  limit: z.coerce.number().int().positive().max(1000).optional().default(20),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
});

export const adminListVouchersQuerySchema = z.object({
  search: z.string().trim().optional(),
  isActive: optionalBooleanQuery,
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
});

export const adminListOrdersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
});

export const adminOrderCodeParamsSchema = z.object({
  orderCode: z.string().trim().min(1),
});

function normalizeOrderStatus(value: unknown) {
  if (typeof value !== "string") return value;

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const statusMap: Record<string, (typeof ORDER_STATUSES)[number]> = {
    pending: "pending",
    "cho xu ly": "pending",
    "dang cho": "pending",
    shipping: "shipping",
    "dang giao": "shipping",
    delivered: "delivered",
    "da giao": "delivered",
    cancelled: "cancelled",
    canceled: "cancelled",
    "da huy": "cancelled",
    huy: "cancelled",
  };

  return statusMap[normalized] ?? value;
}

const orderStatusInputSchema = z.preprocess(
  normalizeOrderStatus,
  z.enum(ORDER_STATUSES),
);

export const adminUpdateOrderStatusBodySchema = z
  .object({
    status: orderStatusInputSchema.optional(),
    orderStatus: orderStatusInputSchema.optional(),
  })
  .strict()
  .refine((body) => body.status || body.orderStatus, {
    message: "Status is required",
  })
  .transform((body) => ({
    status: body.status ?? body.orderStatus!,
  }));

export const adminCreateProductBodySchema = z.object({
  sourceUrl: z.string().trim().url(),
  title: z.string().trim().min(1).max(240),
  price: priceSchema,
  imageUrls: z.array(z.string().trim().url()).optional().default([]),
  localImagePaths: z.array(z.string().trim()).optional().default([]),
  categories: z.array(z.string().trim().min(1)).optional().default([]),
  scrapedAt: z.coerce.date().optional().default(() => new Date()),
});

export const adminUpdateProductBodySchema = adminCreateProductBodySchema
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  });

export const adminCreateVariantBodySchema = z.object({
  sku: z.string().trim().min(1).max(120),
  productSourceUrl: z.string().trim().url().optional(),
  size: z.string().trim().max(80).optional().default(""),
  price: priceSchema,
  isActive: z.boolean().optional().default(true),
});

export const adminUpdateVariantBodySchema = adminCreateVariantBodySchema
  .omit({ productSourceUrl: true })
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  });

function splitTextList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const formStringArraySchema = z.preprocess((value) => {
  if (typeof value === "string") return splitTextList(value);
  return value;
}, z.array(z.string().trim().min(1)));

const formBooleanSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "on", "yes"].includes(normalized)) return true;
  if (["false", "0", "off", "no"].includes(normalized)) return false;
  return value;
}, z.boolean());

const adminVoucherConditionsSchema = z
  .object({
    minSubtotal: z.coerce.number().nonnegative().optional().default(0),
    categoryKeywords: formStringArraySchema.optional().default([]),
    titleKeywords: formStringArraySchema.optional().default([]),
  })
  .strict();

export const adminCreateVoucherBodySchema = z
  .object({
    code: z.string().trim().min(1).max(80).toUpperCase(),
    label: z.string().trim().min(1).max(180),
    discountType: z.literal("percent").optional().default("percent"),
    discountValue: z.coerce.number().min(1).max(100),
    conditions: adminVoucherConditionsSchema.optional(),
    minSubtotal: z.coerce.number().nonnegative().optional(),
    categoryKeywords: formStringArraySchema.optional(),
    titleKeywords: formStringArraySchema.optional(),
    productSourceUrls: formStringArraySchema
      .pipe(z.array(z.string().url()))
      .optional()
      .default([]),
    expiresAt: z.coerce.date(),
    isActive: formBooleanSchema.optional().default(true),
  })
  .strict()
  .transform(({ minSubtotal, categoryKeywords, titleKeywords, ...body }) => ({
    ...body,
    conditions: {
      minSubtotal: minSubtotal ?? body.conditions?.minSubtotal ?? 0,
      categoryKeywords:
        categoryKeywords ?? body.conditions?.categoryKeywords ?? [],
      titleKeywords: titleKeywords ?? body.conditions?.titleKeywords ?? [],
    },
  }));

export const adminUpdateVoucherBodySchema = z
  .object({
    code: z.string().trim().min(1).max(80).toUpperCase().optional(),
    label: z.string().trim().min(1).max(180).optional(),
    discountType: z.literal("percent").optional(),
    discountValue: z.coerce.number().min(1).max(100).optional(),
    conditions: adminVoucherConditionsSchema.optional(),
    minSubtotal: z.coerce.number().nonnegative().optional(),
    categoryKeywords: formStringArraySchema.optional(),
    titleKeywords: formStringArraySchema.optional(),
    productSourceUrls: formStringArraySchema
      .pipe(z.array(z.string().url()))
      .optional(),
    expiresAt: z.coerce.date().optional(),
    isActive: formBooleanSchema.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  })
  .transform(({ minSubtotal, categoryKeywords, titleKeywords, ...body }) => {
    const hasConditionUpdate =
      body.conditions ||
      minSubtotal !== undefined ||
      categoryKeywords !== undefined ||
      titleKeywords !== undefined;

    if (!hasConditionUpdate) return body;

    return {
      ...body,
      conditions: {
        minSubtotal: minSubtotal ?? body.conditions?.minSubtotal ?? 0,
        categoryKeywords:
          categoryKeywords ?? body.conditions?.categoryKeywords ?? [],
        titleKeywords: titleKeywords ?? body.conditions?.titleKeywords ?? [],
      },
    };
  });

export type AdminListUsersQuery = z.infer<typeof adminListUsersQuerySchema>;
export type AdminUpdateUserBody = z.infer<typeof adminUpdateUserBodySchema>;
export type AdminListProductsQuery = z.infer<typeof adminListProductsQuerySchema>;
export type AdminCreateProductBody = z.infer<typeof adminCreateProductBodySchema>;
export type AdminUpdateProductBody = z.infer<typeof adminUpdateProductBodySchema>;
export type AdminCreateVariantBody = z.infer<typeof adminCreateVariantBodySchema>;
export type AdminUpdateVariantBody = z.infer<typeof adminUpdateVariantBodySchema>;
export type AdminListVouchersQuery = z.infer<typeof adminListVouchersQuerySchema>;
export type AdminCreateVoucherBody = z.infer<typeof adminCreateVoucherBodySchema>;
export type AdminUpdateVoucherBody = z.infer<typeof adminUpdateVoucherBodySchema>;
export type AdminListOrdersQuery = z.infer<typeof adminListOrdersQuerySchema>;
export type AdminOrderCodeParams = z.infer<typeof adminOrderCodeParamsSchema>;
export type AdminUpdateOrderStatusBody = z.infer<
  typeof adminUpdateOrderStatusBodySchema
>;
