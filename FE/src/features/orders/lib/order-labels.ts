const DELIVERY_LABELS: Record<string, string> = {
  standard: "Standard delivery",
  express: "Express delivery",
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on delivery (COD)",
  momo: "MoMo wallet",
  vnpay: "VNPay",
  bank: "Bank transfer",
};

export function deliveryMethodLabel(method?: string): string {
  if (!method) return "—";
  return DELIVERY_LABELS[method] ?? method;
}

export function paymentMethodLabel(method?: string): string {
  if (!method) return "—";
  return PAYMENT_LABELS[method] ?? method;
}
