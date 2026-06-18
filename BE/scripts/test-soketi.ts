/**
 * Smoke test — BE → Soketi connection. Run: npm run test:soketi
 * Requires Soketi running: npm run soketi
 */
import "dotenv/config";
import { getPusherWsOrigin, pusher, pusherConfig } from "../src/config/pusher.config";

async function main() {
  console.log("[test:soketi] ws origin:", getPusherWsOrigin());
  console.log("[test:soketi] app key:", pusherConfig.key);

  await pusher.trigger("test-channel", "test-event", {
    message: "Soketi is reachable from BE",
    at: new Date().toISOString(),
  });

  console.log("[test:soketi] trigger OK on channel test-channel / event test-event");
}

main().catch((err) => {
  console.error("[test:soketi] failed:", err.message);
  console.error("[test:soketi] Is Soketi running? Try: npm run soketi");
  process.exit(1);
});
