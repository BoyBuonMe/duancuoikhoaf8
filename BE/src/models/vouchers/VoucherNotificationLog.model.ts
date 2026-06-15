import mongoose, { Document, Schema } from "mongoose";

export interface IVoucherNotificationLog extends Document {
  userEmail: string;
  productId: string;
  voucherCode: string;
  sentAt: Date;
}

const voucherNotificationLogSchema = new Schema<IVoucherNotificationLog>(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productId: { type: String, required: true, trim: true },
    voucherCode: { type: String, required: true, trim: true, uppercase: true },
    sentAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "voucher_notification_logs" },
);

voucherNotificationLogSchema.index(
  { userEmail: 1, productId: 1, voucherCode: 1 },
  { unique: true },
);

const VoucherNotificationLog = mongoose.model<IVoucherNotificationLog>(
  "VoucherNotificationLog",
  voucherNotificationLogSchema,
);

export default VoucherNotificationLog;
