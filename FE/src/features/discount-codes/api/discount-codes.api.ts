import { httpClient } from "@/utils/http";

export interface AppliedDiscountCode {
  code: string;
  label: string;
  discountType: "percent";
  discountValue: number;
  discountAmount: number;
}

export async function applyDiscountCodeApi(
  code: string,
  subtotal: number,
): Promise<{ discountCode: AppliedDiscountCode }> {
  const { data } = await httpClient.post<{ discountCode: AppliedDiscountCode }>(
    "/discount-codes/apply",
    { code, subtotal },
  );
  return data;
}
