/**
 * Quick MoMo sandbox smoke test — run: npm run test:momo
 */
import "dotenv/config";
import axios from "axios";
import {
  buildMomoCreateSignature,
  buildMomoOrderInfo,
  generateMomoOrderId,
  generateMomoRequestId,
} from "../src/models/payments/momo-payment.utils";
import { momoConfig } from "../src/config/momo.config";

async function main() {
  const requestId = generateMomoRequestId();
  const orderId = generateMomoOrderId(requestId);
  const amountVnd = 55_000;
  const orderInfo = buildMomoOrderInfo(orderId);
  const extraData = "";

  const signature = buildMomoCreateSignature({
    accessKey: momoConfig.accessKey,
    amountVnd,
    extraData,
    ipnUrl: momoConfig.ipnUrl,
    orderId,
    orderInfo,
    partnerCode: momoConfig.partnerCode,
    redirectUrl: momoConfig.redirectUrl,
    requestId,
    requestType: momoConfig.requestType,
  });

  const body = {
    partnerCode: momoConfig.partnerCode,
    partnerName: momoConfig.partnerName,
    storeId: momoConfig.storeId,
    requestId,
    amount: amountVnd,
    orderId,
    orderInfo,
    redirectUrl: momoConfig.redirectUrl,
    ipnUrl: momoConfig.ipnUrl,
    lang: momoConfig.lang,
    requestType: momoConfig.requestType,
    extraData,
    signature,
  };

  console.log("[test:momo] requestType:", momoConfig.requestType);
  console.log("[test:momo] orderId:", orderId);

  const { data } = await axios.post(
    `${momoConfig.endpoint}/v2/gateway/api/create`,
    body,
    { headers: { "Content-Type": "application/json; charset=UTF-8" } },
  );

  console.log("[test:momo] resultCode:", data.resultCode);
  console.log("[test:momo] message:", data.message);
  console.log("[test:momo] payUrl:", data.payUrl ? "OK" : "MISSING");

  if (data.resultCode !== 0) {
    console.error("[test:momo] subErrors:", data.subErrors);
    process.exit(1);
  }

  const payStatus = await axios.get(data.payUrl, {
    maxRedirects: 0,
    validateStatus: () => true,
  });
  console.log("[test:momo] pay page HTTP:", payStatus.status);
}

main().catch((err) => {
  console.error("[test:momo] failed:", err.response?.data ?? err.message);
  process.exit(1);
});
