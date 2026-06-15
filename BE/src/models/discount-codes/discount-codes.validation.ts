import { z } from "zod";

export const applyDiscountCodeBodySchema = z.object({
  code: z.string().trim().min(1).max(80),
  subtotal: z.coerce.number().min(0),
});

export type ApplyDiscountCodeBody = z.infer<typeof applyDiscountCodeBodySchema>;
