import type {
  ProductDetailResponse,
  ProductListResponse,
} from "@/features/products/model/product.types";
import { getApiOrigin } from "@/lib/nav-categories";

const productsApiUrl = (query?: string): string => {
  const base = `${getApiOrigin()}/api/products`;
  return query ? `${base}?${query}` : base;
};

export async function fetchProductList(options?: {
  categorySlug?: string;
  limit?: number;
  skip?: number;
  signal?: AbortSignal;
}): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    limit: String(options?.limit ?? 40),
    skip: String(options?.skip ?? 0),
  });
  if (options?.categorySlug) {
    params.set("categorySlug", options.categorySlug);
  }

  const res = await fetch(productsApiUrl(params.toString()), {
    signal: options?.signal,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch products: ${res.status} ${res.statusText}`,
    );
  }

  return (await res.json()) as ProductListResponse;
}

export async function searchProductsApi(
  query: string,
  options?: { limit?: number; signal?: AbortSignal },
): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(options?.limit ?? 8),
  });

  const res = await fetch(productsApiUrl(params.toString()), {
    signal: options?.signal,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to search products: ${res.status} ${res.statusText}`,
    );
  }

  return (await res.json()) as ProductListResponse;
}

/**
 * Server-safe products list fetcher. Uses native fetch so it works
 * inside React Server Components and respects Next.js fetch cache
 * tags ("products"). Pass { revalidate } from the caller if needed.
 */
export async function fetchRecentProducts(options?: {
  signal?: AbortSignal;
  revalidate?: number;
}): Promise<ProductListResponse> {
  const res = await fetch(productsApiUrl(), {
    signal: options?.signal,
    next:
      options?.revalidate !== undefined
        ? { revalidate: options.revalidate, tags: ["products"] }
        : { tags: ["products"] },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch products: ${res.status} ${res.statusText}`,
    );
  }

  return (await res.json()) as ProductListResponse;
}

/**
 * Fetch a single product with full variant enrichment (sizes + SKUs).
 * Used by the product detail page to get real SKUs for the cart.
 */
export async function fetchProductBySlug(
  slug: string,
): Promise<ProductDetailResponse> {
  const url = `${getApiOrigin()}/api/products/slug/${encodeURIComponent(slug)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ProductDetailResponse;
}

export async function fetchProductById(
  id: string,
  options?: { signal?: AbortSignal },
): Promise<ProductDetailResponse> {
  const res = await fetch(
    `${getApiOrigin()}/api/products/${encodeURIComponent(id)}`,
    { signal: options?.signal, cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as ProductDetailResponse;
}

export async function rateProductApi(
  id: string,
  rating: number,
): Promise<{ ratingAverage: number; ratingCount: number }> {
  const { httpClient } = await import("@/utils/http");
  const { data } = await httpClient.post<{
    ratingAverage: number;
    ratingCount: number;
  }>(`/products/${encodeURIComponent(id)}/rate`, { rating });
  return data;
}
