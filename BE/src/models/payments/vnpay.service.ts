import crypto, { randomBytes } from "node:crypto";
import type { Request } from "express";
import qs from "qs";
import { vnpayConfig, usdToVnd } from "@/config/vnpay.config";
import { httpError } from "@/utils/http-error";
import type { CreateOrderBody } from "@/models/orders/orders.validation";
import * as ordersRepo from "@/models/orders/orders.repository";
import * as ordersService from "@/models/orders/orders.service";
import * as pendingVnpayRepo from "@/models/payments/pending-vnpay.repository";

function formatVnpayDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

function addMinutesVietnam(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60_000);
}

/** VNPay demo sortObject — required for a valid SecureHash */
function sortVnpayObject(
  params: Record<string, string | number | undefined | null>,
): Record<string, string> {
  const sorted: Record<string, string> = {};
  const encodedKeys = Object.keys(params)
    .filter((key) => {
      const value = params[key];
      return value !== undefined && value !== null && value !== "";
    })
    .map((key) => encodeURIComponent(key))
    .sort();

  for (const encodedKey of encodedKeys) {
    const key = decodeURIComponent(encodedKey);
    sorted[key] = encodeURIComponent(String(params[key])).replace(/%20/g, "+");
  }

  return sorted;
}

function signVnpayParams(params: Record<string, string>): string {
  const signData = qs.stringify(params, { encode: false });
  return crypto
    .createHmac("sha512", vnpayConfig.hashSecret)
    .update(signData, "utf-8")
    .digest("hex");
}

function buildVnpayPaymentUrl(params: Record<string, string>): string {
  // VNPay demo signs and builds the URL with encode: false to avoid double-encoding ReturnUrl.
  return `${vnpayConfig.paymentUrl}?${qs.stringify(params, { encode: false })}`;
}

function verifyVnpayCallback(query: Record<string, unknown>) {
  const secureHash = String(query.vnp_SecureHash ?? "");
  if (!secureHash) throw httpError("Missing VNPay secure hash", 400);

  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (key === "vnp_SecureHash" || key === "vnp_SecureHashType") continue;
    if (value === undefined || value === null || value === "") continue;
    raw[key] = String(value);
  }

  const sorted = sortVnpayObject(raw);
  const expectedHash = signVnpayParams(sorted);
  if (secureHash !== expectedHash) {
    throw httpError("Invalid VNPay secure hash", 400);
  }

  return {
    txnRef: String(query.vnp_TxnRef ?? ""),
    responseCode: String(query.vnp_ResponseCode ?? ""),
    amount: Number(query.vnp_Amount ?? 0),
  };
}

function generateVnpTxnRef(date = new Date()): string {
  return `${formatVnpayDate(date)}${randomBytes(2).toString("hex").toUpperCase()}`;
}

function normalizeVnpayIp(ip: string): string {
  const cleaned = ip.replace("::ffff:", "").trim();
  if (!cleaned || cleaned === "::1" || cleaned.includes(":")) {
    return "127.0.0.1";
  }
  return cleaned;
}

export function resolveClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return normalizeVnpayIp(ip);
  }
  return normalizeVnpayIp(req.socket.remoteAddress ?? "127.0.0.1");
}

export async function createVnpayPaymentFromCheckout(
  user: ordersService.CheckoutUser,
  body: CreateOrderBody,
  clientIp: string,
) {
  if (body.paymentMethod !== "vnpay") {
    throw httpError("Checkout must use VNPay payment", 400);
  }

  await ordersService.validateCheckoutForOrder(user, body);

  const date = new Date();
  const vnpTxnRef = generateVnpTxnRef(date);
  const amountVnd = usdToVnd(body.total.amount);
  if (amountVnd < 10_000) {
    throw httpError(
      "Order total is too low for VNPay (minimum 10,000 VND after conversion)",
      400,
    );
  }
  const createDate = formatVnpayDate(date);
  const expireDate = formatVnpayDate(addMinutesVietnam(date, 15));
  const orderInfo = `Thanh toan don hang ${vnpTxnRef}`;

  await pendingVnpayRepo.createPendingVnpayPayment({
    vnpTxnRef,
    userEmail: user.email,
    checkout: body,
    amountVnd,
  });

  const vnpParams = sortVnpayObject({
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Locale: vnpayConfig.locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: vnpTxnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: vnpayConfig.orderType,
    vnp_Amount: amountVnd * 100,
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: normalizeVnpayIp(clientIp),
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  });

  const secureHash = signVnpayParams(vnpParams);
  const payUrl = buildVnpayPaymentUrl({
    ...vnpParams,
    vnp_SecureHash: secureHash,
  });

  return {
    vnpTxnRef,
    amountVnd,
    amountUsd: body.total.amount,
    currency: body.total.currency,
    payUrl,
  };
}

async function finalizePaidVnpayPayment(vnpTxnRef: string, paidAmount?: number) {
  const pending = await pendingVnpayRepo.findPendingVnpayPaymentByTxnRef(vnpTxnRef);
  if (!pending) {
    throw httpError("Pending VNPay payment not found", 404);
  }

  if (paidAmount !== undefined && paidAmount !== pending.amountVnd * 100) {
    throw httpError("VNPay amount does not match checkout", 400);
  }

  if (pending.status === "completed" && pending.orderCode) {
    const order = await ordersRepo.findOrderByCode(pending.orderCode);
    if (!order) throw httpError("Order not found for completed VNPay payment", 404);
    return { order, created: false };
  }

  const existingOrder = await ordersRepo.findOrderByVnpTxnRef(vnpTxnRef);
  if (existingOrder) {
    await pendingVnpayRepo.markPendingVnpayPaymentCompleted(
      vnpTxnRef,
      existingOrder.orderCode,
    );
    return { order: existingOrder, created: false };
  }

  const order = await ordersService.createOrder(pending.userEmail, pending.checkout, {
    status: "shipping",
    isPay: true,
    vnpTxnRef,
    clearCart: true,
  });

  await pendingVnpayRepo.markPendingVnpayPaymentCompleted(vnpTxnRef, order.orderCode);

  return { order, created: true };
}

export async function getVnpayPaymentResult(email: string, vnpTxnRef: string) {
  const pending = await pendingVnpayRepo.findPendingVnpayPaymentByTxnRef(vnpTxnRef);
  if (!pending || pending.userEmail !== email) {
    throw httpError("VNPay payment not found", 404);
  }

  if (pending.status === "completed" && pending.orderCode) {
    const order = await ordersService.getOrder(email, pending.orderCode);
    return { status: "completed" as const, order };
  }

  return { status: "pending" as const, order: null };
}

async function finalizeFailedVnpayPayment(vnpTxnRef: string) {
  const pending = await pendingVnpayRepo.findPendingVnpayPaymentByTxnRef(vnpTxnRef);
  if (!pending) {
    throw httpError("Pending VNPay payment not found", 404);
  }

  if (pending.status === "completed" && pending.orderCode) {
    const order = await ordersRepo.findOrderByCode(pending.orderCode);
    if (!order) throw httpError("Order not found for completed VNPay payment", 404);
    return { order, created: false };
  }

  const existingOrder = await ordersRepo.findOrderByVnpTxnRef(vnpTxnRef);
  if (existingOrder) {
    await pendingVnpayRepo.markPendingVnpayPaymentCompleted(
      vnpTxnRef,
      existingOrder.orderCode,
    );
    return { order: existingOrder, created: false };
  }

  const order = await ordersService.createOrder(pending.userEmail, pending.checkout, {
    status: "payment_failed",
    isPay: false,
    vnpTxnRef,
    clearCart: true,
  });

  await pendingVnpayRepo.markPendingVnpayPaymentCompleted(vnpTxnRef, order.orderCode);

  return { order, created: true };
}

export async function processVnpayCallback(query: Record<string, unknown>) {
  const { txnRef, responseCode, amount } = verifyVnpayCallback(query);
  const isSuccess = responseCode === "00";

  const pending = await pendingVnpayRepo.findPendingVnpayPaymentByTxnRef(txnRef);
  if (!pending) {
    throw httpError("Pending VNPay payment not found", 404);
  }

  const amountVnd = pending.amountVnd;
  const amountUsd = pending.checkout.total.amount;

  if (isSuccess) {
    const { order, created } = await finalizePaidVnpayPayment(txnRef, amount);
    return { success: true, orderCode: order.orderCode, amountVnd, amountUsd, created };
  }

  const { order, created } = await finalizeFailedVnpayPayment(txnRef);
  return { success: false, orderCode: order.orderCode, amountVnd, amountUsd, created };
}

export async function handleVnpayIpn(query: Record<string, unknown>) {
  try {
    const result = await processVnpayCallback(query);
    if (!result.success) {
      return { RspCode: "00", Message: "Confirm Success" };
    }
    return { RspCode: "00", Message: "Confirm Success" };
  } catch {
    return { RspCode: "97", Message: "Invalid signature" };
  }
}
