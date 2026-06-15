function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/** Public HTTPS origin MoMo can reach (ngrok, localtunnel, deploy URL). */
export function resolveMomoPublicApiOrigin(): string {
  const publicOrigin =
    process.env.MOMO_PUBLIC_API_ORIGIN?.trim() ||
    process.env.NGROK_URL?.trim();

  if (publicOrigin) {
    return stripTrailingSlash(publicOrigin);
  }

  return stripTrailingSlash(process.env.API_ORIGIN ?? "http://localhost:3001");
}

export function isLocalMomoCallbackUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

export function hasMomoPublicTunnelConfigured(): boolean {
  return Boolean(
    process.env.MOMO_PUBLIC_API_ORIGIN?.trim() || process.env.NGROK_URL?.trim(),
  );
}

function resolveMomoCallbackUrl(kind: "return" | "ipn"): string {
  const base = resolveMomoPublicApiOrigin();
  const derived = `${base}/api/payments/momo/${kind === "return" ? "return" : "ipn"}`;

  // When a public tunnel is configured, always use it so MoMo can reach IPN/redirect.
  if (hasMomoPublicTunnelConfigured()) {
    return derived;
  }

  const explicit =
    kind === "return"
      ? process.env.MOMO_REDIRECT_URL?.trim()
      : process.env.MOMO_IPN_URL?.trim();

  return explicit || derived;
}

const publicApiOrigin = resolveMomoPublicApiOrigin();

export const momoConfig = {
  accessKey: process.env.MOMO_ACCESS_KEY ?? "F8BBA842ECF85",
  secretKey: process.env.MOMO_SECRET_KEY ?? "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  partnerCode: process.env.MOMO_PARTNER_CODE ?? "MOMO",
  partnerName: process.env.MOMO_PARTNER_NAME ?? "MoMo",
  storeId: process.env.MOMO_STORE_ID ?? "MoMoStore",
  endpoint: process.env.MOMO_ENDPOINT ?? "https://test-payment.momo.vn",
  /** payWithMethod = web page (ATM, credit card, MoMo wallet). captureWallet = QR/deeplink only. */
  requestType: process.env.MOMO_REQUEST_TYPE ?? "payWithMethod",
  lang: process.env.MOMO_LANG ?? "vi",
  usdToVndRate: Number(process.env.MOMO_USD_TO_VND_RATE ?? "25000"),
  publicApiOrigin,
  redirectUrl: resolveMomoCallbackUrl("return"),
  ipnUrl: resolveMomoCallbackUrl("ipn"),
  frontendOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000",
};

export function usdToVnd(amountUsd: number, rate = momoConfig.usdToVndRate): number {
  return Math.max(1, Math.round(amountUsd * rate));
}
