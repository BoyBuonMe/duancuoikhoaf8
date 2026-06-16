"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createSupportConversationApi,
  getOrCreateAiConversationApi,
  listAiMessagesApi,
  listSupportMessagesApi,
  sendAiMessageApi,
  sendSupportMessageApi,
} from "@/features/chat/api/chat.api";
import type { ChatConversation, ChatMessage } from "@/features/chat/types/chat.types";
import { useSupportRealtime } from "@/features/chat/hooks/useSupportRealtime";

function mergeMessage(list: ChatMessage[], incoming: ChatMessage) {
  if (list.some((m) => m.id === incoming.id)) return list;
  return [...list, incoming].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function useAiChat() {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { conversation: conv } = await getOrCreateAiConversationApi();
      setConversation(conv);
      const { messages: rows } = await listAiMessagesApi(conv.id);
      setMessages(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start AI chat");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = async (content: string) => {
    if (!conversation || !content.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      const result = await sendAiMessageApi(conversation.id, content.trim());
      setMessages((prev) =>
        mergeMessage(mergeMessage(prev, result.userMessage), result.assistantMessage),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    bootstrap,
    sendMessage,
  };
}

function messagesEqual(a: ChatMessage[], b: ChatMessage[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item.id === b[index].id);
}

export function useUserSupportChat() {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { conversation: conv } = await createSupportConversationApi();
      setConversation(conv);
      const { messages: rows } = await listSupportMessagesApi(conv.id);
      setMessages(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open support chat");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { usingPolling, pollMessages, pollIntervalMs } = useSupportRealtime({
    conversationId: conversation?.id ?? null,
    enabled: Boolean(conversation),
    onMessage: (message) => {
      setMessages((prev) => mergeMessage(prev, message));
    },
  });

  useEffect(() => {
    if (!conversation?.id || !usingPolling) return;
    const timer = window.setInterval(async () => {
      try {
        const rows = await pollMessages();
        setMessages((prev) => (messagesEqual(prev, rows) ? prev : rows));
      } catch {
        /* ignore */
      }
    }, pollIntervalMs);
    return () => window.clearInterval(timer);
  }, [conversation?.id, usingPolling, pollMessages, pollIntervalMs]);

  const sendMessage = async (content: string) => {
    if (!conversation || !content.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      const { message } = await sendSupportMessageApi(conversation.id, content.trim());
      setMessages((prev) => mergeMessage(prev, message));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    usingPolling,
    bootstrap,
    sendMessage,
  };
}
