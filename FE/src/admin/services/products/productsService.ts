import { createAsyncThunk } from "@reduxjs/toolkit";
import http from "@/admin/utils/http";

export interface ProductPrice {
  amount: number;
  currency: string;
}

export interface Product {
  _id: string;
  title: string;
  price: ProductPrice;
  imageUrls: string[];
  categories: string[];
  sourceUrl: string;
  scrapedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  title: string;
  price: { amount: number; currency: string };
  categories: string[];
  imageUrls: string[];
  sourceUrl?: string;
}

export interface ListProductsParams {
  limit?: number;
  skip?: number;
  categorySlug?: string;
  search?: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  limit: number;
  skip: number;
}

export const getProducts = createAsyncThunk(
  "products/getProducts",
  async (params: ListProductsParams = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.limit) query.set("limit", String(params.limit));
      if (params.skip) query.set("skip", String(params.skip));
      if (params.search) query.set("search", params.search);
      if (params.categorySlug) query.set("category", params.categorySlug);
      const qs = query.toString();
      const data = await http.get<ProductsResponse>(
        `/admin/products${qs ? `?${qs}` : ""}`,
      );
      return data;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể tải danh sách sản phẩm";
      return rejectWithValue(msg);
    }
  },
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (payload: ProductPayload, { rejectWithValue }) => {
    try {
      const data = await http.post<{ product: Product }>("/admin/products", payload);
      return data.product;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tạo sản phẩm";
      return rejectWithValue(msg);
    }
  },
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (
    { id, payload }: { id: string; payload: ProductPayload },
    { rejectWithValue },
  ) => {
    try {
      const data = await http.patch<{ product: Product }>(
        `/admin/products/${id}`,
        payload,
      );
      return data.product;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể cập nhật sản phẩm";
      return rejectWithValue(msg);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await http.del(`/admin/products/${id}`);
      return id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể xóa sản phẩm";
      return rejectWithValue(msg);
    }
  },
);
