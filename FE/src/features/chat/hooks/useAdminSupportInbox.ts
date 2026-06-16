"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  listSupportConversationsApi,
  listSupportMessagesApi,
  sendSupportMessageApi,
  updateSupportConversationApi,
} from "@/features/chat/api/chat.api";
import type {
  ChatConversation,
  ChatMessage,
  ConversationStatus,
} from "@/features/chat/types/chat.types";
import { useSupportRealtime } from "@/features/chat/hooks/useSupportRealtime";

function mergeMessage(list: ChatMessage[], incoming: ChatMessage) {
  if (list.some((m) => m.id === incoming.id)) return list;
  return [...list, incoming].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function conversationsEqual(a: ChatConversation[], b: ChatConversation[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      item.id === other.id &&
      item.status === other.status &&
      item.lastMessageAt === other.lastMessageAt &&
      item.assignedAdminId === other.assignedAdminId
    );
  });
}

function messagesEqual(a: ChatMessage[], b: ChatMessage[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item.id === b[index].id);
}

export function useAdminSupportInbox(initialStatus?: ConversationStatus) {
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "all">(
    initialStatus ?? "open",
  );
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const loadConversations = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setIsLoadingList(true);
        setError(null);
      }

      try {
        const status = statusFilter === "all" ? undefined : statusFilter;
        const { conversations: rows } = await listSupportConversationsApi(status);

        setConversations((prev) => (conversationsEqual(prev, rows) ? prev : rows));

        const currentSelectedId = selectedIdRef.current;
        if (rows.length > 0 && !currentSelectedId) {
          setSelectedId(rows[0].id);
        } else if (
          currentSelectedId &&
          !rows.some((row) => row.id === currentSelectedId)
        ) {
          setSelectedId(rows[0]?.id ?? null);
        }
      } catch (e) {
        if (!silent) {
          setError(
            e instanceof Error ? e.message : "Failed to load conversations",
          );
        }
      } finally {
        if (!silent) {
          setIsLoadingList(false);
        }
      }
    },
    [statusFilter],
  );

  const loadMessages = useCallback(
    async (conversationId: string, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setIsLoadingMessages(true);
      }

      try {
        const { messages: rows } = await listSupportMessagesApi(conversationId);
        setMessages((prev) => (messagesEqual(prev, rows) ? prev : rows));
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : "Failed to load messages");
        }
      } finally {
        if (!silent) {
          setIsLoadingMessages(false);
        }
      }
    },
    [],
  );

  const loadConversationsRef = useRef(loadConversations);
  loadConversationsRef.current = loadConversations;

  const loadMessagesRef = useRef(loadMessages);
  loadMessagesRef.current = loadMessages;

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  const { usingPolling, pollIntervalMs } = useSupportRealtime({
    conversationId: selectedId,
    subscribeAdminInbox: true,
    onMessage: (message) => {
      if (message.conversationId === selectedIdRef.current) {
        setMessages((prev) => mergeMessage(prev, message));
      }
    },
    onConversationUpdated: () => {
      void loadConversationsRef.current({ silent: true });
    },
  });

  useEffect(() => {
    if (!selectedId || !usingPolling) return;

    const timer = window.setInterval(() => {
      void loadMessagesRef.current(selectedId, { silent: true });
    }, pollIntervalMs);

    return () => window.clearInterval(timer);
  }, [selectedId, usingPolling, pollIntervalMs]);

  useEffect(() => {
    if (!usingPolling) return;

    const timer = window.setInterval(() => {
      void loadConversationsRef.current({ silent: true });
    }, pollIntervalMs);

    return () => window.clearInterval(timer);
  }, [usingPolling, pollIntervalMs]);

  const sendReply = async (content: string) => {
    if (!selectedId || !content.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      const { message } = await sendSupportMessageApi(selectedId, content.trim());
      setMessages((prev) => mergeMessage(prev, message));
      await loadConversations({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const closeConversation = async () => {
    if (!selectedId) return;
    setError(null);
    try {
      await updateSupportConversationApi(selectedId, { status: "closed" });
      await loadConversations({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to close conversation");
    }
  };

  const selectedConversation =
    conversations.find((c) => c.id === selectedId) ?? null;

  return {
    statusFilter,
    setStatusFilter,
    conversations,
    selectedId,
    setSelectedId,
    selectedConversation,
    messages,
    isLoadingList,
    isLoadingMessages,
    isSending,
    error,
    usingPolling,
    sendReply,
    closeConversation,
    refresh: () => loadConversations(),
  };
}
