import { httpError } from "@/utils/http-error";
import * as discountCodesRepo from "@/models/discount-codes/discount-codes.repository";
import { computePercentDiscount } from "@/models/vouchers/vouchers.service";

export interface DiscountCodeView {
  code: string;
  label: string;
  discountType: "percent";
  discountValue: number;
  discountAmount: number;
}

function isDiscountCodeActive(
  doc: { expiresAt: Date | string; isActive: boolean },
  now = new Date(),
) {
  const expiresAt =
    doc.expiresAt instanceof Date ? doc.expiresAt : new Date(doc.expiresAt);
  return doc.isActive && expiresAt > now;
}

export async function validateDiscountCodeForCheckout(input: {
  code: string;
  subtotal: number;
}): Promise<DiscountCodeView> {
  const normalized = input.code.trim().toLowerCase();
  if (!normalized) {
    throw httpError("Discount code is required", 400);
  }

  const doc = await discountCodesRepo.findDiscountCodeByCode(normalized);
  if (!doc || !isDiscountCodeActive(doc)) {
    throw httpError("Discount code is invalid or expired", 400);
  }

  const discountAmount = computePercentDiscount(
    input.subtotal,
    doc.discountValue,
  );

  return {
    code: doc.code,
    label: doc.label,
    discountType: doc.discountType,
    discountValue: doc.discountValue,
    discountAmount,
  };
}
