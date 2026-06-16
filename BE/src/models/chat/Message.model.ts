import mongoose, { Document, Schema } from "mongoose";

export const MESSAGE_SENDER_ROLES = ["user", "admin", "assistant"] as const;
export type MessageSenderRole = (typeof MESSAGE_SENDER_ROLES)[number];

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId | null;
  senderRole: MessageSenderRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    senderRole: {
      type: String,
      enum: MESSAGE_SENDER_ROLES,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
  },
  { timestamps: true, collection: "messages" },
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
