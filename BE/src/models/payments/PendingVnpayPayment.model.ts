import mongoose, { Document, Schema } from "mongoose";
import type { CreateOrderBody } from "@/models/orders/orders.validation";

export type PendingVnpayPaymentStatus = "pending" | "completed" | "failed";

interface IPendingVnpayPayment extends Document {
  vnpTxnRef: string;
  userEmail: string;
  checkout: CreateOrderBody;
  amountVnd: number;
  status: PendingVnpayPaymentStatus;
  orderCode?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pendingVnpayPaymentSchema = new Schema<IPendingVnpayPayment>(
  {
    vnpTxnRef: {
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
    amountVnd: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderCode: { type: String, trim: true, uppercase: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "pending_vnpay_payments" },
);

pendingVnpayPaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingVnpayPayment = mongoose.model<IPendingVnpayPayment>(
  "PendingVnpayPayment",
  pendingVnpayPaymentSchema,
);

export default PendingVnpayPayment;
