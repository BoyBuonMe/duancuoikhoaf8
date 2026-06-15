import mongoose, { Document, Schema } from "mongoose";
import type { CreateOrderBody } from "@/models/orders/orders.validation";

export type PendingMomoPaymentStatus = "pending" | "completed" | "failed";

interface IPendingMomoPayment extends Document {
  momoOrderId: string;
  userEmail: string;
  checkout: CreateOrderBody;
  status: PendingMomoPaymentStatus;
  orderCode?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pendingMomoPaymentSchema = new Schema<IPendingMomoPayment>(
  {
    momoOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    checkout: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderCode: { type: String, trim: true, uppercase: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "pending_momo_payments" },
);

pendingMomoPaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingMomoPayment = mongoose.model<IPendingMomoPayment>(
  "PendingMomoPayment",
  pendingMomoPaymentSchema,
);

export default PendingMomoPayment;
