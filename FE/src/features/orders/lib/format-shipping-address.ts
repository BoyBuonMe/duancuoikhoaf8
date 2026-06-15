import { provinces, wards } from "@/lib/vietnam-address";
import type { Order } from "@/features/orders/api/orders.api";

function normalizeCode(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return trimmed;
  const asNumber = Number(trimmed);
  return Number.isNaN(asNumber) ? trimmed : String(asNumber);
}

function findProvinceName(code?: string): string | undefined {
  if (!code) return undefined;
  const normalized = normalizeCode(code);
  return provinces.find(
    (province) =>
      province.code === code ||
      province.code === normalized ||
      normalizeCode(province.code) === normalized,
  )?.name;
}

function findWardName(code?: string): string | undefined {
  if (!code) return undefined;
  const normalized = normalizeCode(code);
  return wards.find(
    (ward) =>
      ward.code === code ||
      ward.code === normalized ||
      normalizeCode(ward.code) === normalized,
  )?.name;
}

export function formatOrderShippingAddress(order: Order): string {
  const address = order.shippingAddress;
  if (!address) return "No shipping address on file";

  const parts = [
    address.streetAddress,
    findWardName(address.wardCode),
    findProvinceName(address.provinceCode),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "No shipping address on file";
}
