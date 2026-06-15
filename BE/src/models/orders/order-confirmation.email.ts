import type { CreateOrderBody } from "@/models/orders/orders.validation";
import type { OrderStatus } from "@/models/orders/Order.model";
import { sendMailMessage } from "@/utils/mail";
import {
  generateOrderEmail,
  type OrderEmailItem,
} from "@/models/orders/order-email.template";

const STORE_NAME = process.env.STORE_NAME ?? "Gymshark";
const STORE_SUPPORT_EMAIL = process.env.STORE_SUPPORT_EMAIL ?? "dphattt@gmail.com";
const STORE_HOTLINE = process.env.STORE_HOTLINE ?? "1900 1234";
const STORE_LOGO_URL = process.env.STORE_LOGO_URL ?? "";
const STORE_URL = process.env.APP_ORIGIN ?? "http://localhost:3000";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  vnpay: "VNPay",
  momo: "MoMo",
  bank: "Chuyển khoản ngân hàng",
  cod: "Thanh toán khi nhận hàng (COD)",
};

export interface OrderConfirmationEmailParams {
  to: string;
  customerName: string;
  customerTell: string;
  orderCode: string;
  createdAt: Date;
  status: OrderStatus;
  items: CreateOrderBody["items"];
  subtotal: CreateOrderBody["subtotal"];
  shippingFee: number;
  voucherDiscount: number;
  promoDiscount: number;
  total: CreateOrderBody["total"];
  paymentMethod?: string;
  checkout: Pick<
    CreateOrderBody,
    "streetAddress" | "provinceName" | "wardName" | "shippingCountry"
  >;
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatOrderDate(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function paymentMethodLabel(method?: string): string {
  if (!method) return "—";
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

function buildShippingAddress(
  checkout: OrderConfirmationEmailParams["checkout"],
): string {
  const parts = [
    checkout.streetAddress?.trim(),
    checkout.wardName?.trim(),
    checkout.provinceName?.trim(),
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(", ");
  if (checkout.shippingCountry === "INT") return "Địa chỉ quốc tế";
  return "—";
}

function mapEmailItems(
  items: OrderConfirmationEmailParams["items"],
): OrderEmailItem[] {
  return items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice.amount,
    lineTotal: item.unitPrice.amount * item.quantity,
    image: item.image,
    size: item.size ?? item.variantLabel,
  }));
}

function isOnlinePrepaidPayment(method?: string): boolean {
  return method === "vnpay" || method === "momo";
}

function buildPaymentSummaryLines(params: OrderConfirmationEmailParams): string[] {
  const lines = [
    `Tạm tính: ${formatUsd(params.subtotal.amount)}`,
  ];

  if (params.voucherDiscount > 0) {
    lines.push(`Giảm giá voucher: -${formatUsd(params.voucherDiscount)}`);
  }
  if (params.promoDiscount > 0) {
    lines.push(
      `Giảm giá mã khuyến mãi: -${formatUsd(params.promoDiscount)}`,
    );
  }

  lines.push(`Phí vận chuyển: ${formatUsd(params.shippingFee)}`);

  if (isOnlinePrepaidPayment(params.paymentMethod)) {
    lines.push(`Đã thanh toán: ${formatUsd(params.total.amount)}`);
    lines.push(`Tổng thanh toán: ${formatUsd(0)}`);
  } else {
    lines.push(`Tổng thanh toán: ${formatUsd(params.total.amount)}`);
  }

  return lines;
}

function buildPlainText(params: OrderConfirmationEmailParams): string {
  const orderDate = formatOrderDate(params.createdAt);
  const shippingAddress = buildShippingAddress(params.checkout);
  const paymentLabel = paymentMethodLabel(params.paymentMethod);

  const productLines = params.items
    .map((item, index) => {
      const lineTotal = item.unitPrice.amount * item.quantity;
      return [
        `${index + 1}. ${item.name}`,
        `   Số lượng: ${item.quantity}`,
        `   Đơn giá: ${formatUsd(item.unitPrice.amount)}`,
        `   Thành tiền: ${formatUsd(lineTotal)}`,
      ].join("\n");
    })
    .join("\n\n");

  const paymentLines = buildPaymentSummaryLines(params);

  return [
    `Xác nhận đơn hàng ${params.orderCode}`,
    "",
    `Xin chào ${params.customerName},`,
    "",
    `Cảm ơn bạn đã mua sắm tại ${STORE_NAME}.`,
    "",
    "Đơn hàng của bạn đã được đặt thành công và đang được xử lý.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "THÔNG TIN ĐƠN HÀNG",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Mã đơn hàng: ${params.orderCode}`,
    `Ngày đặt: ${orderDate}`,
    "Trạng thái: Đang xử lý",
    "",
    "SẢN PHẨM",
    "",
    productLines,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "THÔNG TIN GIAO HÀNG",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Người nhận: ${params.customerName}`,
    `Số điện thoại: ${params.customerTell}`,
    `Địa chỉ: ${shippingAddress}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "THANH TOÁN",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Phương thức: ${paymentLabel}`,
    "",
    ...paymentLines,
    "",
    "Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao cho đơn vị vận chuyển.",
    "",
    "Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ:",
    `Email: ${STORE_SUPPORT_EMAIL}`,
    `Hotline: ${STORE_HOTLINE}`,
    "",
    "Trân trọng,",
    STORE_NAME,
  ].join("\n");
}

export function buildOrderConfirmationEmailContent(
  params: OrderConfirmationEmailParams,
): { subject: string; text: string; html: string } {
  const subject = `Xác nhận đơn hàng ${params.orderCode}`;
  const orderDate = formatOrderDate(params.createdAt);
  const shippingAddress = buildShippingAddress(params.checkout);

  const html = generateOrderEmail({
    customerName: params.customerName,
    customerTell: params.customerTell,
    orderCode: params.orderCode,
    orderDate,
    items: mapEmailItems(params.items),
    shippingAddress,
    paymentMethod: paymentMethodLabel(params.paymentMethod),
    subtotal: params.subtotal.amount,
    shippingFee: params.shippingFee,
    voucherDiscount: params.voucherDiscount,
    promoDiscount: params.promoDiscount,
    total: params.total.amount,
    storeName: STORE_NAME,
    supportEmail: STORE_SUPPORT_EMAIL,
    hotline: STORE_HOTLINE,
    logoUrl: STORE_LOGO_URL || undefined,
    storeUrl: STORE_URL,
    paymentMethodKey: params.paymentMethod,
  });

  return {
    subject,
    text: buildPlainText(params),
    html,
  };
}

export async function sendOrderConfirmationEmail(
  params: OrderConfirmationEmailParams,
): Promise<void> {
  const { subject, text, html } = buildOrderConfirmationEmailContent(params);

  await sendMailMessage({
    to: params.to,
    subject,
    text,
    html,
  });
}

export function shouldSendOrderConfirmationEmail(status: OrderStatus): boolean {
  return status !== "payment_failed";
}
