"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import { listSupportMessagesApi } from "@/features/chat/api/chat.api";
import { readAccessToken } from "@/utils/http";

const POLL_MS = 4000;

function isPusherConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY?.trim());
}

function createPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
  const host = process.env.NEXT_PUBLIC_PUSHER_HOST ?? "127.0.0.1";
  const port = Number(process.env.NEXT_PUBLIC_PUSHER_PORT ?? 6001);
  const forceTLS = process.env.NEXT_PUBLIC_PUSHER_FORCE_TLS === "true";
  const apiBase = process.env.NEXT_PUBLIC_BASE_API ?? "http://localhost:3001/api";

  return new Pusher(key, {
    cluster: "mt1",
    wsHost: host,
    wsPort: port,
    forceTLS,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${apiBase}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${readAccessToken() ?? ""}`,
      },
    },
  });
}

interface UseSupportRealtimeOptions {
  conversationId: string | null;
  enabled?: boolean;
  subscribeAdminInbox?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onConversationUpdated?: (payload: {
    conversationId: string;
    lastMessageAt: string;
  }) => void;
  onConversationDeleted?: (payload: { conversationId: string }) => void;
}

export function useSupportRealtime({
  conversationId,
  enabled = true,
  subscribeAdminInbox = false,
  onMessage,
  onConversationUpdated,
  onConversationDeleted,
}: UseSupportRealtimeOptions) {
  const [pusherConnected, setPusherConnected] = useState(false);
  const usingPolling =
    !enabled || !isPusherConfigured() || !pusherConnected;
  const pusherRef = useRef<Pusher | null>(null);
  const onMessageRef = useRef(onMessage);
  const onConversationUpdatedRef = useRef(onConversationUpdated);
  const onConversationDeletedRef = useRef(onConversationDeleted);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onConversationUpdatedRef.current = onConversationUpdated;
  }, [onConversationUpdated]);

  useEffect(() => {
    onConversationDeletedRef.current = onConversationDeleted;
  }, [onConversationDeleted]);

  useEffect(() => {
<<<<<<< HEAD
    if (!enabled || !isPusherConfigured()) return;
=======
    if (!enabled || !isPusherConfigured()) {
      const timer = window.setTimeout(() => setUsingPolling(true), 0);
      return () => window.clearTimeout(timer);
    }
>>>>>>> features/task-01

    const pusher = createPusherClient();
    pusherRef.current = pusher;

    pusher.connection.bind("connected", () => setPusherConnected(true));
    pusher.connection.bind("unavailable", () => setPusherConnected(false));
    pusher.connection.bind("failed", () => setPusherConnected(false));

    return () => {
      pusher.disconnect();
      pusherRef.current = null;
      setPusherConnected(false);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !conversationId || usingPolling || !pusherRef.current) {
      return;
    }

    const channelName = `private-support.${conversationId}`;
    const channel = pusherRef.current.subscribe(channelName);

    channel.bind("message.sent", (payload: ChatMessage) => {
      onMessageRef.current?.(payload);
    });

    channel.bind(
      "conversation.deleted",
      (payload: { conversationId: string }) => {
        onConversationDeletedRef.current?.(payload);
      },
    );

    return () => {
      channel.unbind_all();
      pusherRef.current?.unsubscribe(channelName);
    };
  }, [conversationId, enabled, usingPolling]);

  useEffect(() => {
    if (!enabled || !subscribeAdminInbox || usingPolling || !pusherRef.current) {
      return;
    }

    const channel = pusherRef.current.subscribe("private-admin-inbox");

    channel.bind(
      "conversation.updated",
      (payload: { conversationId: string; lastMessageAt: string }) => {
        onConversationUpdatedRef.current?.(payload);
      },
    );

    channel.bind(
      "conversation.deleted",
      (payload: { conversationId: string }) => {
        onConversationDeletedRef.current?.(payload);
      },
    );

    return () => {
      channel.unbind_all();
      pusherRef.current?.unsubscribe("private-admin-inbox");
    };
  }, [enabled, subscribeAdminInbox, usingPolling]);

  const pollMessages = useCallback(async () => {
    if (!conversationId) return [];
    const { messages } = await listSupportMessagesApi(conversationId);
    return messages;
  }, [conversationId]);

  return { usingPolling, pollMessages, pollIntervalMs: POLL_MS };
}
