import { httpClient } from "@/utils/http";

export interface VoucherProductSummary {
  productId: string;
  sourceUrl: string;
  title: string;
}

export interface VoucherConditions {
  minSubtotal: number;
  categoryKeywords?: string[];
  titleKeywords?: string[];
}

export interface Voucher {
  code: string;
  label: string;
  discountType: "percent";
  discountValue: number;
  conditions: VoucherConditions;
  expiresAt: string;
  productList: VoucherProductSummary[];
}

export async function fetchApplicableVouchersApi(
  productIds: string[],
  subtotal: number,
): Promise<{ vouchers: Voucher[] }> {
  const params = new URLSearchParams({
    productIds: productIds.join(","),
    subtotal: String(subtotal),
  });
  const { data } = await httpClient.get<{ vouchers: Voucher[] }>(
    `/vouchers/applicable?${params.toString()}`,
  );
  return data;
}
