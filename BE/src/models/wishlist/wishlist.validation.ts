import { z } from "zod";

export const productIdBodySchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
});

export const productIdParamsSchema = z.object({
  productId: z.string().trim().min(1),
});

export type ProductIdBody = z.infer<typeof productIdBodySchema>;
export type ProductIdParams = z.infer<typeof productIdParamsSchema>;
