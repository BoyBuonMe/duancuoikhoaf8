export {
  fetchProductById,
  fetchProductBySlug,
  fetchProductList,
  fetchRecentProducts,
  searchProductsApi,
  rateProductApi,
} from "@/features/products/api/products.api";
export { useCachedProduct } from "@/features/products/hooks/useCachedProduct";
export {
  cacheProduct,
  cacheProducts,
  clearProductCache,
  productsReducer,
  selectCachedProduct,
} from "@/features/products/model/products.slice";
export { useProductCache } from "@/features/products/model/useProductCache";
export { productSlugFromSourceUrl } from "@/features/products/lib/product-slug";
export type {
  Product,
  ProductDetailResponse,
  ProductListResponse,
  ProductSizeOption,
} from "@/features/products/model/product.types";
