import type { Db } from "mongodb";

export async function up(db: Db): Promise<void> {
  await db.collection("vouchers").createIndex({ code: 1 }, { unique: true });
  await db.collection("vouchers").createIndex({ isActive: 1, expiresAt: 1 });
  await db
    .collection("voucher_notification_logs")
    .createIndex({ userEmail: 1, productId: 1, voucherCode: 1 }, { unique: true });
}

export async function down(db: Db): Promise<void> {
  await db.collection("vouchers").dropIndex("code_1");
  await db.collection("vouchers").dropIndex("isActive_1_expiresAt_1");
  await db
    .collection("voucher_notification_logs")
    .dropIndex("userEmail_1_productId_1_voucherCode_1");
}
