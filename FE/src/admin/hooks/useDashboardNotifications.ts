"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pusher from "pusher-js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type DashboardNotification,
} from "@/admin/services/notifications/notificationService";

const CHANNEL_NAME = "private-dashboard-notifications";
const CREATED_EVENT = "notification.created";
const REFRESH_INTERVAL_MS = 5000;

function isPusherConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY?.trim());
}

function createPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
  const host = process.env.NEXT_PUBLIC_PUSHER_HOST ?? "127.0.0.1";
  const port = Number(process.env.NEXT_PUBLIC_PUSHER_PORT ?? 6001);
  const forceTLS = process.env.NEXT_PUBLIC_PUSHER_FORCE_TLS === "true";
  const apiBase = process.env.NEXT_PUBLIC_BASE_API ?? "http://localhost:3001/api";
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

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
        Authorization: `Bearer ${accessToken ?? ""}`,
      },
    },
  });
}

export function useDashboardNotifications() {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pusherRef = useRef<Pusher | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await listNotifications();
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh().catch(() => {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    });
  }, [refresh]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refresh().catch(() => {});
    }, REFRESH_INTERVAL_MS);

    const handleFocus = () => {
      void refresh().catch(() => {});
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refresh]);

  useEffect(() => {
    if (!isPusherConfigured()) return;

    const pusher = createPusherClient();
    pusherRef.current = pusher;
    const channel = pusher.subscribe(CHANNEL_NAME);

    channel.bind(CREATED_EVENT, (payload: DashboardNotification) => {
      setNotifications((current) => {
        const exists = current.some((item) => item.id === payload.id);
        if (exists) return current;
        return [{ ...payload, read: false }, ...current].slice(0, 20);
      });
      setUnreadCount((current) => current + 1);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL_NAME);
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, []);

  const markRead = useCallback(async (id: string) => {
    const wasUnread = notifications.some((item) => item.id === id && !item.read);
    const result = await markNotificationRead(id);
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? result.notification : item,
      ),
    );
    if (wasUnread) {
      setUnreadCount((current) => Math.max(0, current - 1));
    }
  }, [notifications]);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
    setUnreadCount(0);
  }, []);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refresh,
      markRead,
      markAllRead,
    }),
    [loading, markAllRead, markRead, notifications, refresh, unreadCount],
  );
}
