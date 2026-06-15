import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/pages/ProductDetail";
import { ProductList } from "@/components/pages/ProductList";
import {
  fetchProductBySlug,
  fetchProductList,
} from "@/features/products/api/products.api";
import {
  fallbackCatalogCategorySlug,
  isCatalogPath,
  resolveCategorySlugFromPath,
} from "@/features/products/lib/category-path";
import { fetchCategories } from "@/lib/nav-categories";

type RouteParams = { segments: string[] };

function titleFromSegments(segments: string[]): string {
  return segments.map((s) => s.replace(/-/g, " ")).join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { segments } = await params;

  if (isCatalogPath(segments)) {
    return { title: `${titleFromSegments(segments)} | Gymshark` };
  }

  if (segments.length === 1) {
    return { title: `${titleFromSegments(segments)} | Gymshark` };
  }

  return { title: "Products | Gymshark" };
}

export default async function ProductsCatchAllPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { segments } = await params;

  if (isCatalogPath(segments)) {
    const categories = await fetchCategories();
    const categorySlug =
      resolveCategorySlugFromPath(segments, categories) ??
      fallbackCatalogCategorySlug(segments);

    if (!categorySlug) {
      notFound();
    }

    const { products, total } = await fetchProductList({ categorySlug });

    return (
      <main className="w-full flex-1 bg-store-paper">
        <ProductList
          products={products}
          total={total}
          categorySlug={categorySlug}
        />
      </main>
    );
  }

  if (segments.length !== 1) {
    notFound();
  }

  const slug = segments[0];

  let initialProduct = null;
  try {
    const detail = await fetchProductBySlug(slug);
    initialProduct = detail.product;
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetail slug={slug} initialProduct={initialProduct} />
    </main>
  );
}
