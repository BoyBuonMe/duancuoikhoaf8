import * as aiService from "@/models/chat/ai.service";
import * as chatRepo from "@/models/chat/chat.repository";
import {
  assertValidObjectId,
  emitSupportMessage,
  isDashboardRole,
  serializeConversation,
  serializeMessage,
} from "@/models/chat/chat.realtime";
import type { ConversationStatus } from "@/models/chat/Conversation.model";
import { httpError } from "@/utils/http-error";

async function getConversationForUser(
  conversationId: string,
  userId: string,
  role?: string,
) {
  assertValidObjectId(conversationId, "conversationId");
  const conversation = await chatRepo.findConversationById(conversationId);
  if (!conversation) throw httpError("Conversation not found", 404);

  const isOwner = conversation.userId.toString() === userId;
  const isAdmin = isDashboardRole(role);

  if (conversation.type === "support" && !isOwner && !isAdmin) {
    throw httpError("Forbidden", 403);
  }
  if (conversation.type === "ai" && !isOwner) {
    throw httpError("Forbidden", 403);
  }

  return conversation;
}

export async function getOrCreateAiConversation(userId: string) {
  const existing = await chatRepo.findLatestAiConversation(userId);
  if (existing) return serializeConversation(existing);

  const created = await chatRepo.createConversation({
    type: "ai",
    userId,
    status: "open",
  });
  return serializeConversation(created);
}

export async function listAiMessages(userId: string, conversationId: string) {
  await getConversationForUser(conversationId, userId);
  const messages = await chatRepo.listMessages(conversationId);
  return messages.map(serializeMessage);
}

export async function sendAiMessage(
  userId: string,
  conversationId: string,
  content: string,
) {
  const conversation = await getConversationForUser(conversationId, userId);
  if (conversation.type !== "ai") {
    throw httpError("Not an AI conversation", 400);
  }

  const userMsg = await chatRepo.createMessage({
    conversationId,
    senderId: userId,
    senderRole: "user",
    content,
  });

  const prior = await chatRepo.listMessages(conversationId);
  const history = prior
    .filter((m) => m._id.toString() !== userMsg._id.toString())
    .map((m) => ({
      role:
        m.senderRole === "assistant"
          ? ("assistant" as const)
          : ("user" as const),
      content: m.content,
    }));

  let replyText: string;
  try {
    replyText = await aiService.generateAiReply(content, history);
  } catch (err) {
    replyText =
      "Xin lỗi, trợ lý AI tạm thời không phản hồi được. Vui lòng thử lại hoặc liên hệ support.";
    if (process.env.NODE_ENV !== "production") {
      console.error("[chat] AI error:", err);
    }
  }

  const assistantMsg = await chatRepo.createMessage({
    conversationId,
    senderId: null,
    senderRole: "assistant",
    content: replyText,
  });

  await chatRepo.updateConversation(conversationId, {
    lastMessageAt: assistantMsg.createdAt,
  });

  return {
    userMessage: serializeMessage(userMsg),
    assistantMessage: serializeMessage(assistantMsg),
  };
}

export async function createSupportConversation(userId: string) {
  const created = await chatRepo.createConversation({
    type: "support",
    userId,
    status: "open",
  });
  return serializeConversation(created);
}

export async function listSupportConversations(
  userId: string,
  role: string | undefined,
  status?: ConversationStatus,
) {
  if (isDashboardRole(role)) {
    const rows = await chatRepo.listSupportConversationsForAdmin({ status });
    return rows.map(serializeConversation);
  }

  const rows = await chatRepo.listConversationsByUser(userId, "support");
  const filtered = status ? rows.filter((r) => r.status === status) : rows;
  return filtered.map(serializeConversation);
}

export async function listSupportMessages(
  userId: string,
  role: string | undefined,
  conversationId: string,
) {
  await getConversationForUser(conversationId, userId, role);
  const messages = await chatRepo.listMessages(conversationId);
  return messages.map(serializeMessage);
}

export async function sendSupportMessage(
  userId: string,
  role: string | undefined,
  conversationId: string,
  content: string,
) {
  const conversation = await getConversationForUser(conversationId, userId, role);
  if (conversation.type !== "support") {
    throw httpError("Not a support conversation", 400);
  }
  if (conversation.status === "closed") {
    throw httpError("Conversation is closed", 400);
  }

  const isAdmin = isDashboardRole(role);
  const senderRole = isAdmin ? "admin" : "user";

  if (!isAdmin && conversation.userId.toString() !== userId) {
    throw httpError("Forbidden", 403);
  }

  const message = await chatRepo.createMessage({
    conversationId,
    senderId: userId,
    senderRole,
    content,
  });

  const updates: {
    lastMessageAt: Date;
    status?: ConversationStatus;
    assignedAdminId?: string | null;
  } = { lastMessageAt: message.createdAt };

  if (isAdmin && conversation.status === "open") {
    updates.status = "assigned";
    updates.assignedAdminId = userId;
  }

  await chatRepo.updateConversation(conversationId, updates);

  const payload = serializeMessage(message);
  await emitSupportMessage(conversationId, payload);

  return payload;
}

export async function updateSupportConversation(
  userId: string,
  role: string | undefined,
  conversationId: string,
  body: { status?: ConversationStatus; assignedAdminId?: string | null },
) {
  if (!isDashboardRole(role)) {
    throw httpError("Admin access required", 403);
  }

  const conversation = await getConversationForUser(conversationId, userId, role);
  if (conversation.type !== "support") {
    throw httpError("Not a support conversation", 400);
  }

  const updated = await chatRepo.updateConversation(conversationId, {
    status: body.status,
    assignedAdminId: body.assignedAdminId,
  });

  if (!updated) throw httpError("Conversation not found", 404);
  return serializeConversation(updated);
}

export async function authorizePrivateChannel(
  userId: string,
  role: string | undefined,
  channelName: string,
) {
  if (channelName === "private-admin-inbox") {
    if (!isDashboardRole(role)) throw httpError("Forbidden", 403);
    return true;
  }

  if (!channelName.startsWith("private-support.")) {
    throw httpError("Unknown channel", 403);
  }

  const conversationId = channelName.slice("private-support.".length);
  await getConversationForUser(conversationId, userId, role);
  return true;
}
