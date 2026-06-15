import { httpClient } from "@/utils/http";

export type OrderStatus =
  | "pending"
  | "awaiting_pickup"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "payment_failed";

export interface OrderMoney {
  amount: number;
  currency: string;
}

export interface OrderItem {
  productId?: string;
  productSlug?: string;
  sku: string;
  name: string;
  image: string;
  variantLabel?: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: OrderMoney;
}

export interface Order {
  _id: string;
  orderCode: string;
  userEmail: string;
  status: OrderStatus;
  isPay: boolean;
  items: OrderItem[];
  subtotal: OrderMoney;
  shippingFee: number;
  voucherCode?: string;
  voucherDiscount: number;
  promoCode?: string;
  promoDiscount: number;
  total: OrderMoney;
  deliveryMethod?: string;
  paymentMethod?: string;
  shippingAddress?: {
    provinceCode?: string;
    wardCode?: string;
    streetAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  deliveryMethod: string;
  paymentMethod: string;
  provinceCode?: string;
  wardCode?: string;
  streetAddress?: string;
  shippingCountry?: "VN" | "INT";
  provinceName?: string;
  wardName?: string;
  subtotal: OrderMoney;
  shippingFee: number;
  voucherCode?: string;
  voucherDiscount: number;
  promoCode?: string;
  promoDiscount: number;
  total: OrderMoney;
}

export async function listOrdersApi(): Promise<{ orders: Order[] }> {
  const { data } = await httpClient.get<{ orders: Order[] }>("/orders");
  return data;
}

export async function createOrderApi(
  payload: CreateOrderPayload,
): Promise<{ order: Order }> {
  const { data } = await httpClient.post<{ order: Order }>("/orders", payload);
  return data;
}

export async function getOrderApi(
  orderCode: string,
): Promise<{ order: Order }> {
  const { data } = await httpClient.get<{ order: Order }>(
    `/orders/${encodeURIComponent(orderCode)}`,
  );
  return data;
}
