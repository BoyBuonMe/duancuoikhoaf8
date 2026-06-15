import Link from "next/link";
import { homeHeroMedia } from "@/config/homeHero";
import { HomeHeroMedia } from "@/components/pages/HomeHeroMedia";
import { HomeBestsellersCarousel } from "@/components/pages/HomeBestsellersCarousel";
import { HomeMoreGuides } from "@/components/pages/HomeMoreGuides";
import { HomePopularNow } from "@/components/pages/HomePopularNow";
import { HomeProductCarousel } from "@/components/pages/HomeProductCarousel";
import { HomePromoHero } from "@/components/pages/HomePromoHero";
import { HomeShopCategories } from "@/components/pages/HomeShopCategories";
import { fetchProductList } from "@/features/products";

export default async function Home() {
  const [{ products: productList }, { products: womenProducts }] =
    await Promise.all([
      fetchProductList({ limit: 24 }),
      fetchProductList({ categorySlug: "women", limit: 10 }),
    ]);
  const carouselProducts = productList
    .filter((product) => product.imageUrls[0])
    .slice(0, 12);
  const womenBestsellers = womenProducts.filter((product) => product.imageUrls[0]);

  return (
    <main className="-mx-4 -my-9 flex flex-1 flex-col bg-store-paper sm:-mx-6 lg:-mx-8">
      <section className="relative min-h-[calc(100vh-var(--header-h,0px))] overflow-hidden bg-store-ink text-white">
        <HomeHeroMedia {...homeHeroMedia} priority />

        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-start px-4 pb-8 pt-24 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12">
          <div className="flex max-w-2xl flex-col items-start text-left">
            <h1 className="max-w-xl text-lg font-black uppercase leading-[1.12] tracking-normal text-white sm:text-xl lg:text-2xl">
              GYMSHARK X BRATZ
            </h1>
            <p className="mt-3 max-w-xl text-base font-medium leading-6 text-white/95 sm:text-lg">
              The gym just got a serious bratitude problem... The iconic
              collection for looking hot and lifting heavy is here.
            </p>
            <div className="mt-5 flex flex-row flex-wrap gap-5">
              <Link
                href="/products/women"
                className="inline-flex h-16 min-w-54 items-center justify-center bg-store-paper px-7 text-base font-medium text-store-ink-strong transition-colors hover:bg-store-surface"
              >
                Shop The Collection
              </Link>
              <Link
                href="/products"
                className="inline-flex h-16 min-w-40 items-center justify-center border border-white bg-transparent px-7 text-base font-medium text-white transition-colors hover:bg-white hover:text-store-ink-strong"
              >
                Shop New In
              </Link>
            </div>
          </div>
        </div>
      </section>
      <HomeProductCarousel products={carouselProducts} />
      <HomePromoHero />
      <HomeBestsellersCarousel products={womenBestsellers} />
      <HomePopularNow />
      <HomeShopCategories />
      <HomeMoreGuides />
    </main>
  );
}
