import http from "@/admin/utils/http";

export interface ProductCategoryOption {
  _id: string;
  name: string;
  slug: string;
  level: number;
  parentSlug?: string | null;
  path?: string;
  pathSegments?: string[];
}

export interface CurrencyOption {
  _id: string;
  code: string;
}

export async function getProductCategoryOptions() {
  return http.get<{ categories: ProductCategoryOption[]; count: number }>(
    "/admin/product-category-options",
  );
}

export async function createProductCategoryOption(payload: {
  name: string;
  parentSlug?: string | null;
}) {
  return http.post<{ category: ProductCategoryOption }>(
    "/admin/product-category-options",
    payload,
  );
}

export async function updateProductCategoryOption(
  id: string,
  payload: { name: string },
) {
  return http.patch<{ category: ProductCategoryOption }>(
    `/admin/product-category-options/${id}`,
    payload,
  );
}

export async function deleteProductCategoryOption(id: string) {
  return http.del<void>(`/admin/product-category-options/${id}`);
}

export async function getCurrencyOptions() {
  return http.get<{ currencies: CurrencyOption[]; count: number }>(
    "/admin/currency-options",
  );
}

export async function createCurrencyOption(payload: { code: string }) {
  return http.post<{ currency: CurrencyOption }>(
    "/admin/currency-options",
    payload,
  );
}

export async function updateCurrencyOption(
  code: string,
  payload: { code: string },
) {
  return http.patch<{ currency: CurrencyOption }>(
    `/admin/currency-options/${encodeURIComponent(code)}`,
    payload,
  );
}

export async function deleteCurrencyOption(code: string) {
  return http.del<void>(`/admin/currency-options/${encodeURIComponent(code)}`);
}
