import { httpClient } from "@/utils/http";
import type {
  ChatConversation,
  ChatMessage,
  ConversationStatus,
  SendAiMessageResult,
} from "@/features/chat/types/chat.types";

export async function getOrCreateAiConversationApi(): Promise<{
  conversation: ChatConversation;
}> {
  const { data } = await httpClient.post<{ conversation: ChatConversation }>(
    "/chat/ai/conversations",
  );
  return data;
}

export async function listAiMessagesApi(
  conversationId: string,
): Promise<{ messages: ChatMessage[] }> {
  const { data } = await httpClient.get<{ messages: ChatMessage[] }>(
    `/chat/ai/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
  return data;
}

export async function sendAiMessageApi(
  conversationId: string,
  content: string,
): Promise<SendAiMessageResult> {
  const { data } = await httpClient.post<SendAiMessageResult>(
    `/chat/ai/conversations/${encodeURIComponent(conversationId)}/messages`,
    { content },
  );
  return data;
}

export async function listSupportConversationsApi(status?: ConversationStatus): Promise<{
  conversations: ChatConversation[];
}> {
  const { data } = await httpClient.get<{ conversations: ChatConversation[] }>(
    "/chat/support/conversations",
    { params: status ? { status } : undefined },
  );
  return data;
}

export async function createSupportConversationApi(): Promise<{
  conversation: ChatConversation;
}> {
  const { data } = await httpClient.post<{ conversation: ChatConversation }>(
    "/chat/support/conversations",
  );
  return data;
}

export async function listSupportMessagesApi(
  conversationId: string,
): Promise<{ messages: ChatMessage[] }> {
  const { data } = await httpClient.get<{ messages: ChatMessage[] }>(
    `/chat/support/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
  return data;
}

export async function sendSupportMessageApi(
  conversationId: string,
  content: string,
): Promise<{ message: ChatMessage }> {
  const { data } = await httpClient.post<{ message: ChatMessage }>(
    `/chat/support/conversations/${encodeURIComponent(conversationId)}/messages`,
    { content },
  );
  return data;
}

export async function updateSupportConversationApi(
  conversationId: string,
  body: { status?: ConversationStatus; assignedAdminId?: string | null },
): Promise<{ conversation: ChatConversation }> {
  const { data } = await httpClient.patch<{ conversation: ChatConversation }>(
    `/chat/support/conversations/${encodeURIComponent(conversationId)}`,
    body,
  );
  return data;
}
