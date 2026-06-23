"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  
    // ✅ Hiện tin nhắn user NGAY trước khi gọi API
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversation.id,
      senderId: null,
      senderRole: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
  
    try {
      const result = await sendAiMessageApi(conversation.id, content.trim());
      // ✅ Thay thế tin nhắn tạm bằng tin nhắn thật + thêm response AI
      setMessages((prev) =>
        mergeMessage(
          mergeMessage(
            prev.filter((m) => m.id !== optimisticMessage.id), // xóa tin tạm
            result.userMessage,
          ),
          result.assistantMessage,
        ),
      );
    } catch (e) {
      // ✅ Nếu lỗi thì xóa tin nhắn tạm đi
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
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

  const bootstrappingRef = useRef<Promise<ChatConversation | null> | null>(null);

  const bootstrap = useCallback(async () => {
    // Guard against concurrent calls (e.g. React StrictMode double-invoke)
    // creating duplicate conversations.
    if (bootstrappingRef.current) return bootstrappingRef.current;

    const task = (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { conversation: conv } = await createSupportConversationApi();
        setConversation(conv);
        const { messages: rows } = await listSupportMessagesApi(conv.id);
        setMessages(rows);
        return conv;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to open support chat");
        return null;
      } finally {
        setIsLoading(false);
        bootstrappingRef.current = null;
      }
    })();

    bootstrappingRef.current = task;
    return task;
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
    const text = content.trim();
    if (!conversation || !text) return;
    setIsSending(true);
    setError(null);
    try {
      const { message } = await sendSupportMessageApi(conversation.id, text);
      setMessages((prev) => mergeMessage(prev, message));
    } catch (e) {
      // The conversation may have been auto-closed after inactivity. Start a
      // fresh conversation and resend so the user keeps chatting seamlessly.
      const isClosed =
        e instanceof Error && /closed/i.test(e.message);
      if (isClosed) {
        const conv = await bootstrap();
        if (conv) {
          try {
            const { message } = await sendSupportMessageApi(conv.id, text);
            setMessages((prev) => mergeMessage(prev, message));
            return;
          } catch (retryErr) {
            setError(
              retryErr instanceof Error
                ? retryErr.message
                : "Failed to send message",
            );
            return;
          }
        }
      }
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
