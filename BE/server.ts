import "dotenv/config";
import app from "@/app";
import { connectDb } from "@/config/db";
import {
  hasMomoPublicTunnelConfigured,
  isLocalMomoCallbackUrl,
  momoConfig,
} from "@/config/momo.config";
import { vnpayConfig } from "@/config/vnpay.config";
import { startVoucherNotificationScheduler } from "@/jobs/voucher-notification.scheduler";

const PORT = Number(process.env.PORT) || 3001;

function logPaymentConfig() {
  const usingDefaultVnpay =
    !process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET;
  const usingDefaultMomo =
    !process.env.MOMO_ACCESS_KEY || !process.env.MOMO_SECRET_KEY;

  console.log(
    `[payments] VNPay tmn=${vnpayConfig.tmnCode} return=${vnpayConfig.returnUrl}${
      usingDefaultVnpay ? " (WARNING: using fallback credentials)" : ""
    }`,
  );
  console.log(
    `[payments] MoMo partner=${momoConfig.partnerCode} endpoint=${momoConfig.endpoint} requestType=${momoConfig.requestType}`,
  );
  console.log(`[payments] MoMo redirect=${momoConfig.redirectUrl}`);
  console.log(`[payments] MoMo ipn=${momoConfig.ipnUrl}`);

  if (hasMomoPublicTunnelConfigured()) {
    console.log("[payments] MoMo public tunnel: ENABLED (IPN + redirect reachable by MoMo)");
  } else if (
    isLocalMomoCallbackUrl(momoConfig.ipnUrl) ||
    isLocalMomoCallbackUrl(momoConfig.redirectUrl)
  ) {
    console.warn(
      "[payments] MoMo IPN/redirect use localhost — ATM/Napas flow will fail after payment.",
    );
    console.warn(
      "[payments] Fix: run `npm run tunnel:momo`, copy HTTPS URL to MOMO_PUBLIC_API_ORIGIN in .env, restart BE.",
    );
  }
}

connectDb()
  .then(() => {
    logPaymentConfig();
    startVoucherNotificationScheduler();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
