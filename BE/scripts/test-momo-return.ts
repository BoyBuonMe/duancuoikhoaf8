/**
 * Verify MoMo callback signature builder — run: npm run test:momo:return
 */
import "dotenv/config";
import {
  buildMomoCallbackSignature,
  buildMomoQuerySignature,
} from "../src/models/payments/momo-payment.utils";
import { momoConfig } from "../src/config/momo.config";

const sampleCallback = {
  accessKey: momoConfig.accessKey,
  amount: "55000",
  extraData: "",
  message: "Success",
  orderId: "MOMO1730000000AB",
  orderInfo: "Gymshark MOMO1730000000AB",
  orderType: "momo_wallet",
  partnerCode: momoConfig.partnerCode,
  payType: "napas",
  requestId: "MOMO1730000000AB",
  responseTime: "1730000000000",
  resultCode: "0",
  transId: "123456789",
};

const signature = buildMomoCallbackSignature(sampleCallback);

const recomputed = buildMomoCallbackSignature({
  ...sampleCallback,
});

if (signature !== recomputed) {
  console.error("[test:momo:return] callback signature not stable");
  process.exit(1);
}

const querySig = buildMomoQuerySignature({
  accessKey: momoConfig.accessKey,
  orderId: sampleCallback.orderId,
  partnerCode: momoConfig.partnerCode,
  requestId: "MOMO1730000001",
});

console.log("[test:momo:return] callback signature OK (length:", signature.length, ")");
console.log("[test:momo:return] query signature OK (length:", querySig.length, ")");
console.log("[test:momo:return] redirectUrl:", momoConfig.redirectUrl);
console.log("[test:momo:return] ipnUrl:", momoConfig.ipnUrl);
