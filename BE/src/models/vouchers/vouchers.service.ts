import { httpError } from "@/utils/http-error";
import type { IVoucher } from "@/models/vouchers/Voucher.model";
import * as vouchersRepo from "@/models/vouchers/vouchers.repository";
import * as voucherRedemptionsRepo from "@/models/vouchers/voucher-redemptions.repository";

export interface VoucherProductSummary {
  productId: string;
  sourceUrl: string;
  title: string;
}

export interface VoucherView {
  code: string;
  label: string;
  discountType: "percent";
  discountValue: number;
  conditions: IVoucher["conditions"];
  expiresAt: string;
  productList: VoucherProductSummary[];
}

function isVoucherActive(
  voucher: Pick<IVoucher, "expiresAt" | "isActive">,
  now = new Date(),
) {
  const expiresAt =
    voucher.expiresAt instanceof Date
      ? voucher.expiresAt
      : new Date(voucher.expiresAt);
  return voucher.isActive && expiresAt > now;
}

async function toVoucherView(voucher: IVoucher): Promise<VoucherView> {
  const products = await vouchersRepo.findProductsForVoucher(voucher);
  return {
    code: voucher.code,
    label: voucher.label,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    conditions: voucher.conditions,
    expiresAt: new Date(voucher.expiresAt).toISOString(),
    productList: products.map((product) => ({
      productId: String(product._id),
      sourceUrl: product.sourceUrl,
      title: product.title,
    })),
  };
}

function productIdsFromVoucherView(voucher: VoucherView): Set<string> {
  return new Set(voucher.productList.map((product) => product.productId));
}

export function computePercentDiscount(subtotal: number, discountValue: number): number {
  return Math.round((subtotal * discountValue) / 100);
}

export function isVoucherApplicableToCart(
  voucher: VoucherView,
  productIds: string[],
  subtotal: number,
): boolean {
  if (productIds.length === 0) return false;
  if (subtotal < voucher.conditions.minSubtotal) return false;

  const eligibleIds = productIdsFromVoucherView(voucher);
  return productIds.every((productId) => eligibleIds.has(productId));
}

export async function listApplicableVouchers(
  productIds: string[],
  subtotal: number,
  userId?: string,
): Promise<VoucherView[]> {
  const vouchers = await vouchersRepo.findActiveVouchers();
  const redeemedCodes = userId
    ? new Set(await voucherRedemptionsRepo.findRedeemedVoucherCodesForUser(userId))
    : new Set<string>();

  const views = await Promise.all(vouchers.map((voucher) => toVoucherView(voucher)));

  return views.filter(
    (voucher) =>
      !redeemedCodes.has(voucher.code) &&
      isVoucherApplicableToCart(voucher, productIds, subtotal),
  );
}

export async function validateVoucherForOrder(input: {
  voucherCode?: string;
  productIds: string[];
  subtotal: number;
  userId?: string;
}) {
  if (!input.voucherCode?.trim()) {
    return { voucherCode: undefined, voucherDiscount: 0 };
  }

  const voucherDoc = await vouchersRepo.findVoucherByCode(input.voucherCode);
  if (!voucherDoc || !isVoucherActive(voucherDoc)) {
    throw httpError("Voucher is invalid or expired", 400);
  }

  if (input.userId) {
    const alreadyUsed = await voucherRedemptionsRepo.hasUserRedeemedVoucher(
      input.userId,
      voucherDoc.code,
    );
    if (alreadyUsed) {
      throw httpError("You have already used this voucher", 400);
    }
  }

  const voucher = await toVoucherView(voucherDoc);
  if (!isVoucherApplicableToCart(voucher, input.productIds, input.subtotal)) {
    throw httpError("Voucher does not apply to this order", 400);
  }

  return {
    voucherCode: voucher.code,
    voucherDiscount: computePercentDiscount(input.subtotal, voucher.discountValue),
  };
}

export async function listActiveVouchersWithProducts() {
  const vouchers = await vouchersRepo.findActiveVouchers();
  return Promise.all(vouchers.map((voucher) => toVoucherView(voucher)));
}

export async function recordVoucherUsage(input: {
  userId: string;
  userEmail: string;
  voucherCode: string;
  orderCode: string;
}) {
  return voucherRedemptionsRepo.recordVoucherRedemption(input);
}
