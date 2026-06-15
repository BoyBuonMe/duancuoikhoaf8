import { redirect } from "next/navigation";
import { ProductList } from "@/components/pages/ProductList";
import { fetchProductList } from "@/features/products/api/products.api";
import { productListPathForCategory } from "@/features/products/lib/category-path";
import { fetchCategories } from "@/lib/nav-categories";

interface PageProps {
  searchParams: Promise<{ categorySlug?: string; limit?: string; skip?: string }>;
}

export default async function ProductListPage({ searchParams }: PageProps) {
  const { categorySlug } = await searchParams;

  if (categorySlug) {
    const categories = await fetchCategories();
    const category = categories.find((c) => c.slug === categorySlug);

    if (category) {
      redirect(productListPathForCategory(category, categories));
    }
  }

  const { products, total } = await fetchProductList();

  return (
    <main className="w-full flex-1 bg-store-paper">
      <ProductList products={products} total={total} />
    </main>
  );
}
