import crypto, { randomBytes } from "node:crypto";
import { momoConfig } from "@/config/momo.config";

function hmacSha256(raw: string, secretKey: string): string {
  return crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
}

export function buildMomoCreateSignature(params: {
  accessKey: string;
  amountVnd: number;
  extraData: string;
  ipnUrl: string;
  orderId: string;
  orderInfo: string;
  partnerCode: string;
  redirectUrl: string;
  requestId: string;
  requestType: string;
}): string {
  const rawSignature = [
    `accessKey=${params.accessKey}`,
    `amount=${params.amountVnd}`,
    `extraData=${params.extraData}`,
    `ipnUrl=${params.ipnUrl}`,
    `orderId=${params.orderId}`,
    `orderInfo=${params.orderInfo}`,
    `partnerCode=${params.partnerCode}`,
    `redirectUrl=${params.redirectUrl}`,
    `requestId=${params.requestId}`,
    `requestType=${params.requestType}`,
  ].join("&");

  return hmacSha256(rawSignature, momoConfig.secretKey);
}

export function buildMomoCallbackSignature(params: {
  accessKey: string;
  amount: string;
  extraData: string;
  message: string;
  orderId: string;
  orderInfo: string;
  orderType: string;
  partnerCode: string;
  payType: string;
  requestId: string;
  responseTime: string;
  resultCode: string;
  transId: string;
}): string {
  const rawSignature = [
    `accessKey=${params.accessKey}`,
    `amount=${params.amount}`,
    `extraData=${params.extraData}`,
    `message=${params.message}`,
    `orderId=${params.orderId}`,
    `orderInfo=${params.orderInfo}`,
    `orderType=${params.orderType}`,
    `partnerCode=${params.partnerCode}`,
    `payType=${params.payType}`,
    `requestId=${params.requestId}`,
    `responseTime=${params.responseTime}`,
    `resultCode=${params.resultCode}`,
    `transId=${params.transId}`,
  ].join("&");

  return hmacSha256(rawSignature, momoConfig.secretKey);
}

/** MoMo sample: partnerCode + timestamp (+ entropy). Max length 50. */
export function generateMomoRequestId(): string {
  const entropy = randomBytes(2).toString("hex").toUpperCase();
  return `${momoConfig.partnerCode}${Date.now()}${entropy}`.slice(0, 50);
}

/** MoMo sandbox accepts same value as requestId. */
export function generateMomoOrderId(requestId: string): string {
  return requestId;
}

/** Short ASCII order info — MoMo/Napas may prefix merchant name themselves. */
export function buildMomoOrderInfo(orderId: string): string {
  return `Gymshark ${orderId}`.slice(0, 255);
}

export function buildMomoQuerySignature(params: {
  accessKey: string;
  orderId: string;
  partnerCode: string;
  requestId: string;
}): string {
  const rawSignature = [
    `accessKey=${params.accessKey}`,
    `orderId=${params.orderId}`,
    `partnerCode=${params.partnerCode}`,
    `requestId=${params.requestId}`,
  ].join("&");

  return hmacSha256(rawSignature, momoConfig.secretKey);
}

export function formatMomoCreateError(
  message: string,
  resultCode: number,
  subErrors?: unknown,
): string {
  const details = Array.isArray(subErrors)
    ? subErrors
        .map((item) => {
          if (item && typeof item === "object" && "field" in item && "message" in item) {
            return `${String(item.field)}: ${String(item.message)}`;
          }
          return JSON.stringify(item);
        })
        .join("; ")
    : "";

  return details
    ? `${message || "MoMo payment creation failed"} (code ${resultCode}) — ${details}`
    : `${message || "MoMo payment creation failed"} (code ${resultCode})`;
}
