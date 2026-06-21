import Link from "next/link";
import { premiumLiftersHeroMedia } from "@/config/homeHero";
import { HomeHeroMedia } from "@/components/pages/HomeHeroMedia";

export function HomePromoHero() {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-store-ink text-white 2xl:aspect-[8/3] 2xl:min-h-0">
      <HomeHeroMedia {...premiumLiftersHeroMedia} />

      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-10 sm:px-8 lg:px-12 lg:pb-12">
        <div className="max-w-xl text-left">
          <h2 className="text-3xl font-black uppercase leading-none tracking-normal text-white sm:text-4xl">
            New In: Premium Lifter&apos;s Collection
          </h2>
          <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white sm:text-lg">
            Shape the new era in GSLC.
          </p>
          <div className="mt-6 flex flex-row flex-wrap gap-5">
            <Link
              href="/products"
              className="inline-flex h-16 min-w-40 items-center justify-center bg-store-paper px-7 text-base font-medium text-store-ink-strong transition-colors hover:bg-store-surface"
            >
              Shop New In
            </Link>
            <Link
              href="/products/men"
              className="inline-flex h-16 min-w-40 items-center justify-center border border-white bg-transparent px-7 text-base font-medium text-white transition-colors hover:bg-white hover:text-black"
            >
              Shop The Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
