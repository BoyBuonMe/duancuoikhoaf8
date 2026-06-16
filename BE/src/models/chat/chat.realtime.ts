import { isPusherConfigured, pusher } from "@/config/pusher.config";
import type { MessageSenderRole } from "@/models/chat/Message.model";
import { httpError } from "@/utils/http-error";

const DASHBOARD_ROLES = new Set(["admin", "boss"]);

export function isDashboardRole(role?: string) {
  return Boolean(role && DASHBOARD_ROLES.has(role));
}

export function supportChannelName(conversationId: string) {
  return `private-support.${conversationId}`;
}

export function serializeMessage(doc: {
  _id: { toString(): string };
  conversationId: { toString(): string };
  senderId?: { toString(): string } | null;
  senderRole: MessageSenderRole;
  content: string;
  createdAt: Date;
}) {
  return {
    id: doc._id.toString(),
    conversationId: doc.conversationId.toString(),
    senderId: doc.senderId?.toString() ?? null,
    senderRole: doc.senderRole,
    content: doc.content,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function serializeConversation(doc: {
  _id: { toString(): string };
  type: string;
  userId: { toString(): string };
  status: string;
  assignedAdminId?: { toString(): string } | null;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: doc._id.toString(),
    type: doc.type,
    userId: doc.userId.toString(),
    status: doc.status,
    assignedAdminId: doc.assignedAdminId?.toString() ?? null,
    lastMessageAt: doc.lastMessageAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function emitSupportMessage(
  conversationId: string,
  message: ReturnType<typeof serializeMessage>,
) {
  if (!isPusherConfigured()) return;

  try {
    await pusher.trigger(supportChannelName(conversationId), "message.sent", message);
    await pusher.trigger("private-admin-inbox", "conversation.updated", {
      conversationId,
      lastMessageAt: message.createdAt,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[chat] pusher emit failed (Soketi may be offline):", err);
    }
  }
}

export function assertValidObjectId(id: string, label = "id") {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw httpError(`Invalid ${label}`, 400);
  }
}
