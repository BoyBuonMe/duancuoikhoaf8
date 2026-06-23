import Notification, {
  type INotification,
  type NotificationAudienceRole,
} from "@/models/notifications/Notification.model";
import { emitDashboardNotification } from "@/models/notifications/notifications.realtime";
import { httpError } from "@/utils/http-error";

const DASHBOARD_ROLES = new Set<NotificationAudienceRole>(["admin", "boss"]);

export interface SerializedNotification {
  id: string;
  title: string;
  message: string;
  type: INotification["type"];
  roles: NotificationAudienceRole[];
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export function isDashboardNotificationRole(
  role?: string,
): role is NotificationAudienceRole {
  return Boolean(role && DASHBOARD_ROLES.has(role as NotificationAudienceRole));
}

export function serializeNotification(
  doc: INotification,
  userId?: string,
): SerializedNotification {
  return {
    id: doc._id.toString(),
    title: doc.title,
    message: doc.message,
    type: doc.type,
    roles: doc.roles,
    read: userId ? doc.readBy.includes(userId) : false,
    metadata: doc.metadata ?? {},
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function createDashboardNotification(input: {
  title: string;
  message: string;
  type: INotification["type"];
  metadata?: Record<string, unknown>;
  roles?: NotificationAudienceRole[];
}) {
  const notification = await Notification.create({
    title: input.title,
    message: input.message,
    type: input.type,
    metadata: input.metadata ?? {},
    roles: input.roles ?? ["admin", "boss"],
  });

  const payload = serializeNotification(notification);
  await emitDashboardNotification(payload);
  return payload;
}

export async function listDashboardNotifications(
  userId: string,
  role: string | undefined,
  limit = 20,
) {
  if (!isDashboardNotificationRole(role)) {
    throw httpError("Admin access required", 403);
  }

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const query = { roles: role };

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).limit(safeLimit),
    Notification.countDocuments({
      ...query,
      readBy: { $ne: userId },
    }),
  ]);

  return {
    notifications: notifications.map((doc) =>
      serializeNotification(doc, userId),
    ),
    unreadCount,
  };
}

export async function markNotificationRead(
  userId: string,
  role: string | undefined,
  id: string,
) {
  if (!isDashboardNotificationRole(role)) {
    throw httpError("Admin access required", 403);
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, roles: role },
    { $addToSet: { readBy: userId } },
    { new: true },
  );

  if (!notification) throw httpError("Notification not found", 404);
  return serializeNotification(notification, userId);
}

export async function markAllNotificationsRead(
  userId: string,
  role: string | undefined,
) {
  if (!isDashboardNotificationRole(role)) {
    throw httpError("Admin access required", 403);
  }

  await Notification.updateMany(
    { roles: role, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } },
  );

  return { ok: true };
}
