import VoucherRedemption from "@/models/vouchers/VoucherRedemption.model";
import mongoose from "mongoose";

export async function findRedeemedVoucherCodesForUser(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return [];

  const rows = await VoucherRedemption.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .select("voucherCode")
    .lean();

  return rows.map((row) => row.voucherCode);
}

export async function hasUserRedeemedVoucher(
  userId: string,
  voucherCode: string,
) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return false;

  const existing = await VoucherRedemption.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    voucherCode: voucherCode.toUpperCase(),
  }).lean();

  return Boolean(existing);
}

export async function recordVoucherRedemption(input: {
  userId: string;
  userEmail: string;
  voucherCode: string;
  orderCode: string;
}) {
  return VoucherRedemption.create({
    userId: new mongoose.Types.ObjectId(input.userId),
    userEmail: input.userEmail.toLowerCase(),
    voucherCode: input.voucherCode.toUpperCase(),
    orderCode: input.orderCode.toUpperCase(),
    usedAt: new Date(),
  });
}
