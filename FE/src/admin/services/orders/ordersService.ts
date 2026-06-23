import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import http from "@/admin/utils/http";

const ORDERS_ENDPOINT = "/admin/orders";

export type OrderStatus =
  | "pending"
  | "awaiting_pickup"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "payment_failed";

export type RawOrderStatus = OrderStatus | "processing" | "shipped";

export interface Money {
  amount?: number | string;
  currency?: string;
}

export interface OrderItem {
  _id?: string;
  title?: string;
  name?: string;
  quantity?: number;
  price?: number | string | Money;
  unitPrice?: number | string | Money;
  amount?: number | string | Money;
  total?: number | string | Money;
  totalPrice?: number | string | Money;
  imageUrl?: string;
}

export interface OrderAddress {
  provinceCode?: string;
  wardCode?: string;
  streetAddress?: string;
}

export interface Order {
  _id?: string;
  id?: string;
  code?: string;
  orderCode?: string;
  orderNumber?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  email?: string;
  phone?: string;
  paymentMethod?: string;
  payment?: {
    method?: string;
    provider?: string;
  };
  isPay?: boolean;
  shippingAddress?: string | OrderAddress;
  address?: string | OrderAddress;
  items?: OrderItem[];
  products?: OrderItem[];
  totalAmount?: number | string | Money;
  total?: number | string | Money;
  totalPrice?: number | string | Money;
  grandTotal?: number | string | Money;
  finalTotal?: number | string | Money;
  subtotal?: number | string | Money;
  summary?: {
    total?: number | string | Money;
    grandTotal?: number | string | Money;
    subtotal?: number | string | Money;
  };
  pricing?: {
    total?: number | string | Money;
    grandTotal?: number | string | Money;
    subtotal?: number | string | Money;
  };
  status?: RawOrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

type OrdersResponse =
  | { orders: Order[]; total?: number }
  | { data: Order[]; total?: number }
  | { data: { orders: Order[]; total?: number } };

type OrderDetailResponse =
  | { order: Order }
  | { data: Order }
  | { data: { order: Order } };

type UpdateOrderStatusResponse =
  | { order: Order }
  | { data: Order }
  | { data: { order: Order } };

export const getOrders = createAsyncThunk(
  "orders/getOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await http.get<OrdersResponse>(ORDERS_ENDPOINT);
    } catch (error) {
      return rejectWithValue(getOrderError(error, "Không thể tải danh sách đơn hàng"));
    }
  },
);

export async function getDetailOrder(id: string) {
  return http.get<OrderDetailResponse>(`${ORDERS_ENDPOINT}/${id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    return await http.patch<UpdateOrderStatusResponse>(
      `${ORDERS_ENDPOINT}/${id}/status`,
      { status },
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return http.patch<UpdateOrderStatusResponse>(`${ORDERS_ENDPOINT}/${id}`, {
        status,
      });
    }

    throw error;
  }
}

export function getOrderError(error: unknown, fallback: string) {
  const responseMessage =
    axios.isAxiosError<{ message?: string; error?: string }>(error)
      ? error.response?.data?.message ?? error.response?.data?.error
      : undefined;

  return responseMessage ?? (error instanceof Error ? error.message : fallback);
}
