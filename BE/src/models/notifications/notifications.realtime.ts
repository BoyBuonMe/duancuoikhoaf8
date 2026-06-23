import { isPusherConfigured, pusher } from "@/config/pusher.config";
import type { SerializedNotification } from "@/models/notifications/notifications.service";

export const DASHBOARD_NOTIFICATIONS_CHANNEL = "private-dashboard-notifications";
export const NOTIFICATION_CREATED_EVENT = "notification.created";

export async function emitDashboardNotification(
  notification: SerializedNotification,
) {
  if (!isPusherConfigured()) return;

  try {
    await pusher.trigger(
      DASHBOARD_NOTIFICATIONS_CHANNEL,
      NOTIFICATION_CREATED_EVENT,
      notification,
    );
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[notifications] pusher emit failed (Soketi may be offline):",
        err,
      );
    }
  }
}
