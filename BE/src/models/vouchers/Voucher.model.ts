import mongoose, { Document, Schema } from "mongoose";

export interface IVoucherConditions {
  minSubtotal: number;
  categoryKeywords?: string[];
  titleKeywords?: string[];
}

export interface IVoucher extends Document {
  code: string;
  label: string;
  discountType: "percent";
  discountValue: number;
  conditions: IVoucherConditions;
  productSourceUrls: string[];
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const voucherConditionsSchema = new Schema<IVoucherConditions>(
  {
    minSubtotal: { type: Number, required: true, min: 0, default: 0 },
    categoryKeywords: { type: [String], default: [] },
    titleKeywords: { type: [String], default: [] },
  },
  { _id: false },
);

const voucherSchema = new Schema<IVoucher>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    label: { type: String, required: true, trim: true },
    discountType: {
      type: String,
      enum: ["percent"],
      required: true,
      default: "percent",
    },
    discountValue: { type: Number, required: true, min: 1, max: 100 },
    conditions: { type: voucherConditionsSchema, required: true },
    productSourceUrls: { type: [String], default: [] },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "vouchers" },
);

const Voucher = mongoose.model<IVoucher>("Voucher", voucherSchema);
export default Voucher;
