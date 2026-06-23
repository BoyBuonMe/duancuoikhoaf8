import http from "@/admin/utils/http";

export type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  type:
    | "order_created"
    | "user_registered"
    | "user_updated"
    | "support_message"
    | "product_updated"
    | "product_deleted"
    | "voucher_updated"
    | "voucher_deleted";
  roles: Array<"admin" | "boss">;
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type NotificationListResponse = {
  notifications: DashboardNotification[];
  unreadCount: number;
};

export function listNotifications(limit = 20) {
  return http.get<NotificationListResponse>(
    `/admin/notifications?limit=${limit}`,
  );
}

export function markNotificationRead(id: string) {
  return http.patch<{ notification: DashboardNotification }>(
    `/admin/notifications/${id}/read`,
  );
}

export function markAllNotificationsRead() {
  return http.patch<{ ok: true }>("/admin/notifications/read-all");
}
