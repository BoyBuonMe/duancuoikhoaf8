import { httpClient } from "@/utils/http";
import type { Product } from "@/features/products/model/product.types";

export interface WishlistItemResponse {
  sku: string;
  productId: string;
  addedAt: string;
  product: Product;
}

export interface WishlistResponse {
  userEmail: string;
  items: WishlistItemResponse[];
  updatedAt: string | null;
}

export interface ToggleWishlistResponse extends WishlistResponse {
  wishlisted: boolean;
  productId: string;
}

export async function getWishlistApi(): Promise<WishlistResponse> {
  const { data } = await httpClient.get<WishlistResponse>("/wishlist");
  return data;
}

export async function toggleWishlistItemApi(
  productId: string,
): Promise<ToggleWishlistResponse> {
  const { data } = await httpClient.post<ToggleWishlistResponse>(
    "/wishlist/items",
    { productId },
  );
  return data;
}

export async function removeWishlistItemApi(
  productId: string,
): Promise<WishlistResponse> {
  const { data } = await httpClient.delete<WishlistResponse>(
    `/wishlist/items/${encodeURIComponent(productId)}`,
  );
  return data;
}

export async function clearWishlistApi(): Promise<WishlistResponse> {
  const { data } = await httpClient.delete<WishlistResponse>("/wishlist");
  return data;
}
