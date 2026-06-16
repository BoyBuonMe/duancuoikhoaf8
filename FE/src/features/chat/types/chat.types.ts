export type ConversationType = "ai" | "support";
export type ConversationStatus = "open" | "assigned" | "closed";
export type MessageSenderRole = "user" | "admin" | "assistant";

export interface ChatConversation {
  id: string;
  type: ConversationType;
  userId: string;
  status: ConversationStatus;
  assignedAdminId: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderRole: MessageSenderRole;
  content: string;
  createdAt: string;
}

export interface SendAiMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}
