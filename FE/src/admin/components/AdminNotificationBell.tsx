"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardNotifications } from "@/admin/hooks/useDashboardNotifications";
import type { DashboardNotification } from "@/admin/services/notifications/notificationService";

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function notificationHref(notification: DashboardNotification) {
  if (notification.type === "order_created") {
    return "/admin/orders";
  }

  if (
    notification.type === "product_updated" ||
    notification.type === "product_deleted"
  ) {
    return "/admin/products";
  }

  if (
    notification.type === "voucher_updated" ||
    notification.type === "voucher_deleted"
  ) {
    return "/admin/promotions";
  }

  if (notification.type === "support_message") {
    return "/admin/support";
  }

  if (
    notification.type === "user_registered" ||
    notification.type === "user_updated"
  ) {
    return "/admin/customers";
  }

  return "/admin";
}

export function AdminNotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
  } = useDashboardNotifications();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          void refresh().catch(() => {});
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex size-9 items-center justify-center text-slate-500 transition hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          aria-label="Thông báo"
        >
          <Bell size={19} />
          {unreadCount > 0 ? (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-slate-950">
            Thông báo
          </DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Đánh dấu đã đọc
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-96 overflow-y-auto overflow-x-hidden p-1">
          {loading ? (
            <div className="px-3 py-8 text-center text-sm text-slate-500">
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-slate-500">
              Chưa có thông báo nào
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="items-start gap-3 rounded-md px-3 py-3"
                onSelect={(event) => {
                  event.preventDefault();
                  if (!notification.read) {
                    void markRead(notification.id);
                  }
                  window.location.assign(notificationHref(notification));
                }}
              >
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    notification.read ? "bg-slate-300" : "bg-indigo-500"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-950">
                    {notification.title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-slate-600">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-slate-400">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
