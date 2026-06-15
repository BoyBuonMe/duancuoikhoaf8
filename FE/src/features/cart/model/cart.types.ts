import type { Money } from "@/shared/types";

export interface CartItem {
  sku: string;
  name: string;
  image: string;
  variantLabel?: string;
  productSlug?: string;
  quantity: number;
  unitPrice: Money;
}

export interface CartSnapshot {
  items: CartItem[];
  subtotal: Money;
  count: number;
}
