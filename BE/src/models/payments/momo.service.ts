import axios from "axios";
import { momoConfig, usdToVnd } from "@/config/momo.config";
import { httpError } from "@/utils/http-error";
import type { CreateOrderBody } from "@/models/orders/orders.validation";
import * as ordersRepo from "@/models/orders/orders.repository";
import * as ordersService from "@/models/orders/orders.service";
import * as pendingMomoRepo from "@/models/payments/pending-momo.repository";
import {
  buildMomoCallbackSignature,
  buildMomoCreateSignature,
  buildMomoOrderInfo,
  buildMomoQuerySignature,
  formatMomoCreateError,
  generateMomoOrderId,
  generateMomoRequestId,
} from "@/models/payments/momo-payment.utils";

const momoClient = axios.create({
  baseURL: momoConfig.endpoint,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
  },
});

interface MomoCreateResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  subErrors?: unknown;
}

interface MomoQueryResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payType?: string;
  transId?: number;
}

export interface MomoFinalizeResult {
  orderCode: string;
  success: boolean;
  created: boolean;
}

function verifyMomoCallbackSignature(query: Record<string, unknown>): void {
  const signature = String(query.signature ?? "");
  if (!signature) return;

  const expectedSignature = buildMomoCallbackSignature({
    accessKey: momoConfig.accessKey,
    amount: String(query.amount ?? ""),
    extraData: String(query.extraData ?? ""),
    message: String(query.message ?? ""),
    orderId: String(query.orderId ?? ""),
    orderInfo: String(query.orderInfo ?? ""),
    orderType: String(query.orderType ?? ""),
    partnerCode: String(query.partnerCode ?? ""),
    payType: String(query.payType ?? ""),
    requestId: String(query.requestId ?? ""),
    responseTime: String(query.responseTime ?? ""),
    resultCode: String(query.resultCode ?? query.errorCode ?? ""),
    transId: String(query.transId ?? ""),
  });

  if (signature !== expectedSignature) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[momo] signature mismatch on callback", {
        orderId: query.orderId,
        resultCode: query.resultCode ?? query.errorCode,
      });
    }
    throw httpError("Invalid MoMo callback signature", 400);
  }
}

async function finalizeMomoPayment(
  momoOrderId: string,
  isSuccess: boolean,
): Promise<MomoFinalizeResult> {
  const normalizedId = momoOrderId.toUpperCase();

  const pending =
    await pendingMomoRepo.findPendingMomoPaymentByOrderId(normalizedId);

  if (pending?.status === "completed" && pending.orderCode) {
    return {
      orderCode: pending.orderCode,
      success: isSuccess,
      created: false,
    };
  }

  const existingOrder = await ordersRepo.findOrderByMomoOrderId(normalizedId);
  if (existingOrder?.orderCode) {
    if (pending) {
      await pendingMomoRepo.markPendingMomoPaymentCompleted(
        normalizedId,
        existingOrder.orderCode,
      );
    }
    return {
      orderCode: existingOrder.orderCode,
      success: isSuccess,
      created: false,
    };
  }

  if (!pending) {
    throw httpError("MoMo pending payment not found", 404);
  }

  const order = await ordersService.createOrder(pending.userEmail, pending.checkout, {
    status: isSuccess ? "shipping" : "payment_failed",
    isPay: isSuccess,
    momoOrderId: normalizedId,
    clearCart: true,
  });

  await pendingMomoRepo.markPendingMomoPaymentCompleted(
    normalizedId,
    order.orderCode,
  );

  return {
    orderCode: order.orderCode,
    success: isSuccess,
    created: true,
  };
}

export async function queryMomoPaymentStatus(momoOrderId: string) {
  const orderId = momoOrderId.toUpperCase();
  const requestId = `${momoConfig.partnerCode}${Date.now()}`.slice(0, 50);
  const signature = buildMomoQuerySignature({
    accessKey: momoConfig.accessKey,
    orderId,
    partnerCode: momoConfig.partnerCode,
    requestId,
  });

  const { data } = await momoClient.post<MomoQueryResponse>(
    "/v2/gateway/api/query",
    {
      partnerCode: momoConfig.partnerCode,
      requestId,
      orderId,
      lang: momoConfig.lang,
      signature,
    },
  );

  return data;
}

export async function createMomoPaymentFromCheckout(
  user: ordersService.CheckoutUser,
  body: CreateOrderBody,
) {
  if (body.paymentMethod !== "momo") {
    throw httpError("Checkout must use MoMo payment", 400);
  }

  await ordersService.validateCheckoutForOrder(user, body);

  const requestId = generateMomoRequestId();
  const momoOrderId = generateMomoOrderId(requestId);
  const amountVnd = usdToVnd(body.total.amount);
  if (amountVnd < 10_000) {
    throw httpError(
      "Order total is too low for MoMo (minimum 10,000 VND after conversion)",
      400,
    );
  }

  const orderInfo = buildMomoOrderInfo(momoOrderId);
  const extraData = "";
  const redirectUrl = momoConfig.redirectUrl.trim();
  const ipnUrl = momoConfig.ipnUrl.trim();

  await pendingMomoRepo.createPendingMomoPayment({
    momoOrderId,
    userEmail: user.email,
    checkout: body,
  });

  const signature = buildMomoCreateSignature({
    accessKey: momoConfig.accessKey,
    amountVnd,
    extraData,
    ipnUrl,
    orderId: momoOrderId,
    orderInfo,
    partnerCode: momoConfig.partnerCode,
    redirectUrl,
    requestId,
    requestType: momoConfig.requestType,
  });

  const requestBody = {
    partnerCode: momoConfig.partnerCode,
    partnerName: momoConfig.partnerName,
    storeId: momoConfig.storeId,
    requestId,
    amount: amountVnd,
    orderId: momoOrderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: momoConfig.lang,
    requestType: momoConfig.requestType,
    extraData,
    signature,
  };

  const { data } = await momoClient.post<MomoCreateResponse>(
    "/v2/gateway/api/create",
    requestBody,
  );

  if (data.resultCode !== 0) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[momo] create failed:", JSON.stringify(data));
    }
    throw httpError(
      formatMomoCreateError(data.message, data.resultCode, data.subErrors),
      502,
    );
  }

  return {
    momoOrderId,
    amountVnd,
    amountUsd: body.total.amount,
    currency: body.total.currency,
    payUrl: data.payUrl ?? null,
    qrCodeUrl: data.qrCodeUrl ?? null,
    deeplink: data.deeplink ?? null,
    requestId,
    redirectUrl,
    ipnUrl,
  };
}

export async function processMomoReturn(query: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[momo] return query:", JSON.stringify(query));
  }

  verifyMomoCallbackSignature(query);

  const momoOrderId = String(query.orderId ?? "");
  if (!momoOrderId) {
    throw httpError("Missing MoMo order id on return", 400);
  }

  let resultCode = String(query.resultCode ?? query.errorCode ?? "");
  let isSuccess = resultCode === "0";

  if (!resultCode) {
    try {
      const status = await queryMomoPaymentStatus(momoOrderId);
      resultCode = String(status.resultCode);
      isSuccess = status.resultCode === 0;
      if (process.env.NODE_ENV !== "production") {
        console.info("[momo] query fallback:", {
          orderId: momoOrderId,
          resultCode: status.resultCode,
          message: status.message,
        });
      }
    } catch (err) {
      console.error("[momo] query fallback failed:", err);
    }
  }

  return finalizeMomoPayment(momoOrderId, isSuccess);
}

export async function handleMomoIpn(body: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[momo] IPN body:", JSON.stringify(body));
  }

  verifyMomoCallbackSignature(body);

  const orderId = String(body.orderId ?? "");
  const requestId = String(body.requestId ?? "");
  const resultCode = String(body.resultCode ?? "");

  const ack = (code: number, ackMessage: string) => ({
    partnerCode: momoConfig.partnerCode,
    requestId,
    orderId,
    resultCode: code,
    message: ackMessage,
  });

  if (resultCode !== "0") {
    return ack(0, "Confirm Success");
  }

  await finalizeMomoPayment(orderId, true);
  return ack(0, "Confirm Success");
}
