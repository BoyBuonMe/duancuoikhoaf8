import Pusher from "pusher";

export const pusherConfig = {
  appId: process.env.PUSHER_APP_ID ?? "app-id",
  key: process.env.PUSHER_APP_KEY ?? "app-key",
  secret: process.env.PUSHER_APP_SECRET ?? "app-secret",
  host: process.env.PUSHER_HOST ?? "127.0.0.1",
  port: Number(process.env.PUSHER_PORT ?? "6001"),
  scheme: process.env.PUSHER_SCHEME ?? "http",
};

export function isPusherConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID?.trim() &&
      process.env.PUSHER_APP_KEY?.trim() &&
      process.env.PUSHER_APP_SECRET?.trim(),
  );
}

export function getPusherWsOrigin(): string {
  const { scheme, host, port } = pusherConfig;
  return `${scheme}://${host}:${port}`;
}

/** Server-side Pusher client (Soketi-compatible). Used to trigger realtime events. */
export const pusher = new Pusher({
  appId: pusherConfig.appId,
  key: pusherConfig.key,
  secret: pusherConfig.secret,
  host: pusherConfig.host,
  port: String(pusherConfig.port),
  useTLS: pusherConfig.scheme === "https",
});
