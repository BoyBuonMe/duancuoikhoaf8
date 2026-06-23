import { randomBytes } from "node:crypto";
import { httpError } from "@/utils/http-error";
import User from "@/models/users/User.model";
import type { CreateOrderBody } from "@/models/orders/orders.validation";
import type { OrderStatus } from "@/models/orders/Order.model";
import * as ordersRepo from "@/models/orders/orders.repository";
import * as vouchersService from "@/models/vouchers/vouchers.service";
import * as discountCodesService from "@/models/discount-codes/discount-codes.service";
import * as shippingService from "@/models/shipping/shipping.service";
import * as cartService from "@/models/cart/cart.service";
import * as usersService from "@/models/users/users.service";
import {
  sendOrderConfirmationEmail,
  shouldSendOrderConfirmationEmail,
} from "@/models/orders/order-confirmation.email";
import { createDashboardNotification } from "@/models/notifications/notifications.service";

function generateOrderCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `GS-${date}-${suffix}`;
}

export interface CheckoutUser {
  id: string;
  email: string;
  name?: string;
}

export interface CheckoutValidationResult {
  voucherCode?: string;
  voucherDiscount: number;
  promoCode?: string;
  promoDiscount: number;
}

export async function validateCheckoutForOrder(
  user: CheckoutUser,
  body: CreateOrderBody,
): Promise<CheckoutValidationResult> {
  const productIds = body.items
    .map((item) => item.productId)
    .filter((id): id is string => Boolean(id));

  const voucherResult = await vouchersService.validateVoucherForOrder({
    voucherCode: body.voucherCode,
    productIds,
    subtotal: body.subtotal.amount,
    userId: user.id,
  });

  let promoCode: string | undefined;
  let promoDiscount = 0;

  if (body.promoCode?.trim()) {
    const promo = await discountCodesService.validateDiscountCodeForCheckout({
      code: body.promoCode,
      subtotal: body.subtotal.amount,
    });
    promoCode = promo.code;
    promoDiscount = promo.discountAmount;
  }

  const totalDiscount = voucherResult.voucherDiscount + promoDiscount;
  const expectedTotal =
    Math.max(0, body.subtotal.amount - totalDiscount) + body.shippingFee;

  if (Math.abs(expectedTotal - body.total.amount) > 0.01) {
    throw httpError("Order total does not match voucher calculation", 400);
  }

  if (
    body.promoDiscount !== undefined &&
    Math.abs(body.promoDiscount - promoDiscount) > 0.01
  ) {
    throw httpError("Promo discount does not match", 400);
  }

  await shippingService.validateShippingForOrder({
    country: body.shippingCountry,
    deliveryMethod: body.deliveryMethod,
    provinceCode: body.provinceCode,
    provinceName: body.provinceName,
    wardName: body.wardName,
    streetAddress: body.streetAddress,
    shippingFee: body.shippingFee,
  });

  return {
    voucherCode: voucherResult.voucherCode,
    voucherDiscount: voucherResult.voucherDiscount,
    promoCode,
    promoDiscount,
  };
}

async function resolveCheckoutUser(email: string): Promise<CheckoutUser> {
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("_id email name")
    .lean();
  if (!user) throw httpError("User not found", 404);

  return {
    id: String(user._id),
    email: user.email,
    name: user.name?.trim() || "Khách hàng",
  };
}

async function notifyOrderConfirmationEmail(
  user: CheckoutUser,
  body: CreateOrderBody,
  order: {
    orderCode: string;
    status: OrderStatus;
    createdAt?: Date;
    voucherDiscount: number;
    promoDiscount: number;
  },
  checkoutResult: CheckoutValidationResult,
): Promise<void> {
  if (!shouldSendOrderConfirmationEmail(order.status)) return;

  const customerTell = await usersService.resolveUserTellForOrder(user.email);

  await sendOrderConfirmationEmail({
    to: user.email,
    customerName: user.name?.trim() || "Khách hàng",
    customerTell,
    orderCode: order.orderCode,
    createdAt: order.createdAt ?? new Date(),
    status: order.status,
    items: body.items,
    subtotal: body.subtotal,
    shippingFee: body.shippingFee,
    voucherDiscount: checkoutResult.voucherDiscount,
    promoDiscount: checkoutResult.promoDiscount,
    total: body.total,
    paymentMethod: body.paymentMethod,
    checkout: {
      streetAddress: body.streetAddress,
      provinceName: body.provinceName,
      wardName: body.wardName,
      shippingCountry: body.shippingCountry,
    },
  });
}

export async function listOrders(email: string) {
  return ordersRepo.findOrdersByEmail(email);
}

export async function getOrder(email: string, orderCode: string) {
  const order = await ordersRepo.findOrderByCodeForEmail(orderCode, email);
  if (!order) throw httpError("Order not found", 404);
  return order;
}

export async function createOrder(
  email: string,
  body: CreateOrderBody,
  options?: {
    status?: OrderStatus;
    isPay?: boolean;
    momoOrderId?: string;
    vnpTxnRef?: string;
    clearCart?: boolean;
  },
) {
  const user = await resolveCheckoutUser(email);
  const checkoutResult = await validateCheckoutForOrder(user, body);
  const orderCode = generateOrderCode();

  const order = await ordersRepo.createOrder({
    orderCode,
    userEmail: email,
    status: options?.status ?? "pending",
    isPay: options?.isPay ?? false,
    momoOrderId: options?.momoOrderId,
    vnpTxnRef: options?.vnpTxnRef,
    items: body.items,
    subtotal: body.subtotal,
    shippingFee: body.shippingFee,
    voucherCode: checkoutResult.voucherCode,
    voucherDiscount: checkoutResult.voucherDiscount,
    promoCode: checkoutResult.promoCode,
    promoDiscount: checkoutResult.promoDiscount,
    total: body.total,
    deliveryMethod: body.deliveryMethod,
    paymentMethod: body.paymentMethod,
    shippingAddress: {
      provinceCode: body.provinceCode,
      wardCode: body.wardCode,
      streetAddress: body.streetAddress,
    },
  });

  if (checkoutResult.voucherCode) {
    await vouchersService.recordVoucherUsage({
      userId: user.id,
      userEmail: user.email,
      voucherCode: checkoutResult.voucherCode,
      orderCode,
    });
  }

  if (options?.clearCart !== false) {
    await cartService.removeCartItemsBySkus(
      email,
      body.items.map((item) => item.sku),
    );
  }

  const orderStatus = (options?.status ?? "pending") as OrderStatus;

  void createDashboardNotification({
    type: "order_created",
    title: "Đơn hàng mới",
    message: `${user.name || user.email} vừa tạo đơn ${order.orderCode}`,
    metadata: {
      orderCode: order.orderCode,
      userEmail: user.email,
      total: body.total,
      status: orderStatus,
    },
  }).catch((err) => {
    console.error(
      `[notifications] Failed to create order notification for ${order.orderCode}:`,
      err,
    );
  });

  void notifyOrderConfirmationEmail(
    user,
    body,
    {
      orderCode: order.orderCode,
      status: orderStatus,
      createdAt: order.createdAt,
      voucherDiscount: checkoutResult.voucherDiscount,
      promoDiscount: checkoutResult.promoDiscount,
    },
    checkoutResult,
  ).catch((err) => {
    console.error(
      `[orders] Failed to send confirmation email for ${order.orderCode}:`,
      err,
    );
  });

  return order;
}
