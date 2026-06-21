import mongoose, { Document, Schema } from "mongoose";

export type NotificationAudienceRole = "admin" | "boss";
export type NotificationType =
  | "order_created"
  | "user_registered"
  | "user_updated"
  | "support_message"
  | "product_updated"
  | "product_deleted"
  | "voucher_updated"
  | "voucher_deleted";

export interface INotification extends Document {
  title: string;
  message: string;
  type: NotificationType;
  roles: NotificationAudienceRole[];
  readBy: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "order_created",
        "user_registered",
        "user_updated",
        "support_message",
        "product_updated",
        "product_deleted",
        "voucher_updated",
        "voucher_deleted",
      ],
      required: true,
      default: "order_created",
    },
    roles: {
      type: [String],
      enum: ["admin", "boss"],
      required: true,
      default: ["admin", "boss"],
    },
    readBy: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "notifications" },
);

notificationSchema.index({ roles: 1, createdAt: -1 });
notificationSchema.index({ readBy: 1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
