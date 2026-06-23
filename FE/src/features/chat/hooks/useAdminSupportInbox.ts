"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteSupportConversationApi,
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

const EMPTY_MESSAGES: ChatMessage[] = [];

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

interface UseAdminSupportInboxOptions {
  initialStatus?: ConversationStatus | "all";
  autoSelect?: boolean;
}

export function useAdminSupportInbox(
  options?: ConversationStatus | UseAdminSupportInboxOptions,
) {
  const normalized: UseAdminSupportInboxOptions =
    typeof options === "string" ? { initialStatus: options } : options ?? {};
  const { initialStatus, autoSelect = true } = normalized;

  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "all">(
    initialStatus ?? "open",
  );
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadedFilter, setLoadedFilter] = useState<
    ConversationStatus | "all" | null
  >(null);
  const [loadedMessagesId, setLoadedMessagesId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

<<<<<<< HEAD
  // Loading flags are derived (not stored) so we never call setState
  // synchronously inside the data-loading effects below.
  const isLoadingList = loadedFilter !== statusFilter;
  const isLoadingMessages =
    selectedId != null && loadedMessagesId !== selectedId;
=======
  const selectedIdRef = useRef(selectedId);
>>>>>>> features/task-01

  const selectedIdRef = useRef(selectedId);
  const autoSelectRef = useRef(autoSelect);
<<<<<<< HEAD
=======

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    autoSelectRef.current = autoSelect;
  }, [autoSelect]);
>>>>>>> features/task-01

  const loadConversations = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      try {
        const status = statusFilter === "all" ? undefined : statusFilter;
        const { conversations: rows } = await listSupportConversationsApi(status);

        setConversations((prev) => (conversationsEqual(prev, rows) ? prev : rows));
        if (!silent) setError(null);

        const currentSelectedId = selectedIdRef.current;
        if (autoSelectRef.current) {
          if (rows.length > 0 && !currentSelectedId) {
            setSelectedId(rows[0].id);
          } else if (
            currentSelectedId &&
            !rows.some((row) => row.id === currentSelectedId)
          ) {
            setSelectedId(rows[0]?.id ?? null);
          }
        } else if (
          currentSelectedId &&
          !rows.some((row) => row.id === currentSelectedId)
        ) {
          setSelectedId(null);
        }
      } catch (e) {
        if (!silent) {
          setError(
            e instanceof Error ? e.message : "Failed to load conversations",
          );
        }
      } finally {
        setLoadedFilter(statusFilter);
      }
    },
    [statusFilter],
  );

  const loadMessages = useCallback(
    async (conversationId: string, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      try {
        const { messages: rows } = await listSupportMessagesApi(conversationId);
        setMessages((prev) => (messagesEqual(prev, rows) ? prev : rows));
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : "Failed to load messages");
        }
      } finally {
        setLoadedMessagesId(conversationId);
      }
    },
    [],
  );

  const loadConversationsRef = useRef(loadConversations);
<<<<<<< HEAD
  const loadMessagesRef = useRef(loadMessages);

  // Keep "latest value" refs current after each commit, instead of writing
  // them during render (which React's rules of hooks disallows).
  useEffect(() => {
    selectedIdRef.current = selectedId;
    autoSelectRef.current = autoSelect;
    loadConversationsRef.current = loadConversations;
    loadMessagesRef.current = loadMessages;
  });

  // Reload the list whenever the status filter changes. setState happens
  // asynchronously after the request resolves (inside loadConversations), so
  // it's an async callback update, not a synchronous cascade — we call through
  // the ref (same pattern as the polling effects below) so the effect only
  // re-runs on statusFilter.
  useEffect(() => {
    void loadConversationsRef.current();
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedId) return;
    void loadMessagesRef.current(selectedId);
  }, [selectedId]);
=======

  const loadMessagesRef = useRef(loadMessages);

  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  useEffect(() => {
    loadMessagesRef.current = loadMessages;
  }, [loadMessages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selectedId) {
        setMessages([]);
        return;
      }
      void loadMessages(selectedId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedId, loadMessages]);
>>>>>>> features/task-01

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
    onConversationDeleted: ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedIdRef.current === conversationId) {
        setSelectedId(null);
      }
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

  // X — only hides the conversation locally, does not touch the server.
  const hideConversation = useCallback((conversationId: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(conversationId);
      return next;
    });
    setSelectedId((current) =>
      current === conversationId ? null : current,
    );
  }, []);

  // Delete — kills the conversation on the server (admin only).
  const deleteConversation = useCallback(
    async (conversationId?: string) => {
      const targetId = conversationId ?? selectedIdRef.current;
      if (!targetId) return;
      setError(null);
      try {
        await deleteSupportConversationApi(targetId);
        setConversations((prev) => prev.filter((c) => c.id !== targetId));
        setSelectedId((current) => (current === targetId ? null : current));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to delete conversation",
        );
      }
    },
    [],
  );

  const visibleConversations = conversations.filter((conv, index, arr) => {
    if (hiddenIds.has(conv.id)) return false;
    // Defense-in-depth: never render the same conversation id twice.
    return arr.findIndex((c) => c.id === conv.id) === index;
  });

  const selectedConversation =
    conversations.find((c) => c.id === selectedId) ?? null;

  return {
    statusFilter,
    setStatusFilter,
    conversations: visibleConversations,
    selectedId,
    setSelectedId,
    selectedConversation,
    messages: selectedId ? messages : EMPTY_MESSAGES,
    isLoadingList,
    isLoadingMessages,
    isSending,
    error,
    usingPolling,
    sendReply,
    closeConversation,
    hideConversation,
    deleteConversation,
    refresh: () => loadConversations(),
  };
}
