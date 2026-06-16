import { z } from "zod";
import { CONVERSATION_STATUSES } from "@/models/chat/Conversation.model";

export const conversationIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const sendMessageBodySchema = z.object({
  content: z.string().trim().min(1).max(8000),
});

export const supportListQuerySchema = z.object({
  status: z.enum(CONVERSATION_STATUSES).optional(),
});

export const updateSupportConversationBodySchema = z.object({
  status: z.enum(CONVERSATION_STATUSES).optional(),
  assignedAdminId: z.string().trim().nullable().optional(),
});

export const broadcastingAuthBodySchema = z.object({
  socket_id: z.string().trim().min(1),
  channel_name: z.string().trim().min(1),
});

export type ConversationIdParams = z.infer<typeof conversationIdParamsSchema>;
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
export type SupportListQuery = z.infer<typeof supportListQuerySchema>;
export type UpdateSupportConversationBody = z.infer<
  typeof updateSupportConversationBodySchema
>;
export type BroadcastingAuthBody = z.infer<typeof broadcastingAuthBodySchema>;
