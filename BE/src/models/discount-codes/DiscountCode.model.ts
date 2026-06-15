import mongoose, { Document, Schema } from "mongoose";

export interface IDiscountCode extends Document {
  code: string;
  label: string;
  discountType: "percent";
  discountValue: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const discountCodeSchema = new Schema<IDiscountCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: { type: String, required: true, trim: true },
    discountType: {
      type: String,
      enum: ["percent"],
      required: true,
      default: "percent",
    },
    discountValue: { type: Number, required: true, min: 1, max: 100 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "discount_codes" },
);

const DiscountCode = mongoose.model<IDiscountCode>(
  "DiscountCode",
  discountCodeSchema,
);

export default DiscountCode;
