import DiscountCode from "@/models/discount-codes/DiscountCode.model";

export async function findDiscountCodeByCode(code: string) {
  return DiscountCode.findOne({
    code: code.trim().toLowerCase(),
    isActive: true,
  }).lean();
}

export async function findActiveDiscountCodes(now = new Date()) {
  return DiscountCode.find({
    isActive: true,
    expiresAt: { $gt: now },
  }).lean();
}
