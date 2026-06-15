import { runVoucherWishlistNotifications } from "@/jobs/voucher-wishlist-notifier";

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export function startVoucherNotificationScheduler(): void {
  const run = async () => {
    try {
      await runVoucherWishlistNotifications();
    } catch (error) {
      console.error("[voucher-notifier] Scheduled run failed:", error);
    }
  };

  void run();
  setInterval(() => {
    void run();
  }, FOUR_HOURS_MS);

  console.info("[voucher-notifier] Scheduler started (every 4 hours)");
}
