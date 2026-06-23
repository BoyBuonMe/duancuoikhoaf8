import { closeStaleSupportConversations } from "@/models/chat/chat.service";

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

export function startChatInactivityScheduler(): void {
  const run = async () => {
    try {
      const closed = await closeStaleSupportConversations(INACTIVITY_LIMIT_MS);
      if (closed > 0) {
        console.info(`[chat-inactivity] Closed ${closed} idle support conversation(s)`);
      }
    } catch (error) {
      console.error("[chat-inactivity] Scheduled run failed:", error);
    }
  };

  void run();
  setInterval(() => {
    void run();
  }, CHECK_INTERVAL_MS);

  console.info("[chat-inactivity] Scheduler started (checks every minute, 10-min idle limit)");
}
