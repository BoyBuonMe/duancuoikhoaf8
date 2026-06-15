import mongoose, { Document, Schema } from "mongoose";

export interface IVoucherRedemption extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  voucherCode: string;
  orderCode: string;
  usedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const voucherRedemptionSchema = new Schema<IVoucherRedemption>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    userEmail: { type: String, required: true, trim: true, lowercase: true },
    voucherCode: { type: String, required: true, trim: true, uppercase: true },
    orderCode: { type: String, required: true, trim: true, uppercase: true },
    usedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true, collection: "voucher_redemptions" },
);

voucherRedemptionSchema.index({ userId: 1, voucherCode: 1 }, { unique: true });

const VoucherRedemption = mongoose.model<IVoucherRedemption>(
  "VoucherRedemption",
  voucherRedemptionSchema,
);

export default VoucherRedemption;
