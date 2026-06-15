"use client";

import { useEffect, useState } from "react";
import { fetchProductBySlug } from "@/features/products/api/products.api";
import { fetchProductList, type Product } from "@/features/products";
import type { Order } from "@/features/orders/api/orders.api";

const RELATED_LIMIT = 8;

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function scoreRelatedProduct(
  product: Product,
  orderItemNames: Set<string>,
  preferredCategories: Set<string>,
): number {
  if (orderItemNames.has(normalizeTitle(product.title))) return -1;

  let score = 0;
  for (const category of product.categories) {
    if (preferredCategories.has(category)) score += 2;
  }
  return score;
}

export function useOrderRelatedProducts(order: Order | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!order) return;

    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    const load = async () => {
      const orderItemNames = new Set(
        order.items.map((item) => normalizeTitle(item.name)),
      );
      const preferredCategories = new Set<string>();
      const slugs = order.items
        .map((item) => item.productSlug)
        .filter((slug): slug is string => Boolean(slug));

      for (const slug of slugs.slice(0, 3)) {
        try {
          const { product } = await fetchProductBySlug(slug);
          product.categories.forEach((category: string) =>
            preferredCategories.add(category),
          );
        } catch {
          // Ignore missing product slugs and fall back to generic list.
        }
      }

      const categorySlug =
        preferredCategories.has("Womens") || preferredCategories.has("Women")
          ? "women"
          : preferredCategories.has("Mens") || preferredCategories.has("Men")
            ? "men"
            : undefined;

      const response = await fetchProductList({
        categorySlug,
        limit: 60,
      });

      const ranked = response.products
        .map((product) => ({
          product,
          score: scoreRelatedProduct(
            product,
            orderItemNames,
            preferredCategories,
          ),
        }))
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => b.score - a.score);

      const picked: Product[] = [];
      const seen = new Set<string>();

      for (const entry of ranked) {
        if (picked.length >= RELATED_LIMIT) break;
        if (seen.has(entry.product._id)) continue;
        seen.add(entry.product._id);
        picked.push(entry.product);
      }

      if (picked.length < RELATED_LIMIT) {
        for (const product of response.products) {
          if (picked.length >= RELATED_LIMIT) break;
          if (seen.has(product._id)) continue;
          if (orderItemNames.has(normalizeTitle(product.title))) continue;
          seen.add(product._id);
          picked.push(product);
        }
      }

      if (!cancelled) {
        setProducts(picked);
      }
    };

    load()
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [order]);

  return {
    products: order ? products : [],
    loading: order ? loading : false,
  };
}
