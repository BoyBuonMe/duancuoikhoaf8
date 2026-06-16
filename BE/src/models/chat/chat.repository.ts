import mongoose from "mongoose";
import Conversation, {
  type ConversationStatus,
  type ConversationType,
} from "@/models/chat/Conversation.model";
import Message, { type MessageSenderRole } from "@/models/chat/Message.model";

export function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export async function createConversation(data: {
  type: ConversationType;
  userId: string;
  status?: ConversationStatus;
  assignedAdminId?: string | null;
}) {
  return Conversation.create({
    type: data.type,
    userId: toObjectId(data.userId),
    status: data.status ?? "open",
    ...(data.assignedAdminId
      ? { assignedAdminId: toObjectId(data.assignedAdminId) }
      : {}),
    lastMessageAt: new Date(),
  });
}

export async function findConversationById(id: string) {
  return Conversation.findById(id).lean();
}

export async function findLatestAiConversation(userId: string) {
  return Conversation.findOne({
    userId: toObjectId(userId),
    type: "ai",
    status: { $ne: "closed" },
  })
    .sort({ lastMessageAt: -1 })
    .lean();
}

export async function listConversationsByUser(
  userId: string,
  type: ConversationType,
) {
  return Conversation.find({
    userId: toObjectId(userId),
    type,
  })
    .sort({ lastMessageAt: -1 })
    .lean();
}

export async function listSupportConversationsForAdmin(filters: {
  status?: ConversationStatus;
  limit?: number;
}) {
  const query: Record<string, unknown> = { type: "support" };
  if (filters.status) query.status = filters.status;

  return Conversation.find(query)
    .sort({ lastMessageAt: -1 })
    .limit(filters.limit ?? 50)
    .lean();
}

export async function updateConversation(
  id: string,
  update: {
    status?: ConversationStatus;
    assignedAdminId?: string | null;
    lastMessageAt?: Date;
  },
) {
  const $set: Record<string, unknown> = {};
  if (update.status) $set.status = update.status;
  if (update.lastMessageAt) $set.lastMessageAt = update.lastMessageAt;
  if (update.assignedAdminId !== undefined) {
    $set.assignedAdminId =
      update.assignedAdminId === null
        ? null
        : toObjectId(update.assignedAdminId);
  }

  return Conversation.findByIdAndUpdate(id, { $set }, { new: true }).lean();
}

export async function createMessage(data: {
  conversationId: string;
  senderId: string | null;
  senderRole: MessageSenderRole;
  content: string;
}) {
  return Message.create({
    conversationId: toObjectId(data.conversationId),
    senderId: data.senderId ? toObjectId(data.senderId) : null,
    senderRole: data.senderRole,
    content: data.content,
  });
}

export async function listMessages(
  conversationId: string,
  options?: { limit?: number; before?: Date },
) {
  const filter: Record<string, unknown> = {
    conversationId: toObjectId(conversationId),
  };
  if (options?.before) {
    filter.createdAt = { $lt: options.before };
  }

  return Message.find(filter)
    .sort({ createdAt: 1 })
    .limit(options?.limit ?? 100)
    .lean();
}
