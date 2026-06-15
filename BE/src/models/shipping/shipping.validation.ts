import { z } from "zod";

export const shippingQuoteBodySchema = z.object({
  country: z.enum(["VN", "INT"]).default("VN"),
  deliveryMethod: z.enum(["standard", "express"]).optional(),
  provinceCode: z.string().trim().optional(),
  provinceName: z.string().trim().optional(),
  wardCode: z.string().trim().optional(),
  wardName: z.string().trim().optional(),
  streetAddress: z.string().trim().optional(),
});

export type ShippingQuoteBody = z.infer<typeof shippingQuoteBodySchema>;
