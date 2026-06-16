import mongoose, { Document, Schema } from "mongoose";

export const CONVERSATION_TYPES = ["ai", "support"] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export const CONVERSATION_STATUSES = ["open", "assigned", "closed"] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export interface IConversation extends Document {
  type: ConversationType;
  userId: mongoose.Types.ObjectId;
  status: ConversationStatus;
  assignedAdminId?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: CONVERSATION_TYPES,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: CONVERSATION_STATUSES,
      default: "open",
    },
    assignedAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  { timestamps: true, collection: "conversations" },
);

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);

export default Conversation;
