import type { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  await db.collection("discount_codes").createIndex({ code: 1 }, { unique: true });
  await db
    .collection("discount_codes")
    .createIndex({ isActive: 1, expiresAt: 1 });
  await db
    .collection("voucher_redemptions")
    .createIndex({ userId: 1, voucherCode: 1 }, { unique: true });
  await db.collection("voucher_redemptions").createIndex({ userEmail: 1 });
  await db.collection("voucher_redemptions").createIndex({ orderCode: 1 });
}

export async function down(db: Db): Promise<void> {
  await db.collection("discount_codes").dropIndex("code_1");
  await db.collection("discount_codes").dropIndex("isActive_1_expiresAt_1");
  await db
    .collection("voucher_redemptions")
    .dropIndex("userId_1_voucherCode_1");
  await db.collection("voucher_redemptions").dropIndex("userEmail_1");
  await db.collection("voucher_redemptions").dropIndex("orderCode_1");
}
