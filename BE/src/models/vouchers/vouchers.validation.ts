import { z } from "zod";

export const applicableVouchersQuerySchema = z.object({
  productIds: z.string().trim().min(1),
  subtotal: z.coerce.number().min(0).default(0),
});

export type ApplicableVouchersQuery = z.infer<typeof applicableVouchersQuerySchema>;
