"use client";

import { useState } from "react";
import Image from "next/image";
import { LazyImage } from "@/components/product/LazyImage";
import { ProductCardImages } from "@/components/product/ProductCardImages";
import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, ArrowRight } from "lucide-react";
import { IconHeart } from "@/components/icons";
import { useWishlist } from "@/features/wishlist";
import { useHasHydrated } from "@/shared/hooks";
import { formatUsd } from "@/shared/lib/format-money";
import {
  productSlugFromSourceUrl,
  useProductCache,
  type Product,
} from "@/features/products";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HomeViewProps {
  initialProducts: Product[];
}

function deriveCategoryLabel(categories: string[]): string {
  return categories.slice(1).filter(Boolean).join(" › ");
}

export function HomeView({ initialProducts }: HomeViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const wishlist = useWishlist();
  const hasHydrated = useHasHydrated();
  const { cacheProduct } = useProductCache();

  // Pick first 8-10 products for the carousel
  const carouselProducts = initialProducts.slice(0, 10);

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* 1. Hero Banner */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden rounded-2xl border border-store-border/40 shadow-sm">
        <Image
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1600&auto=format&fit=crop"
          alt="Gymshark minimalist athletic banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 md:p-16">
          <div className="max-w-2xl text-white">
            <h1 className="font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-none">
              ALL IN THE DETAIL.
            </h1>
            <p className="mt-4 text-base font-medium text-white/90 sm:text-lg md:text-xl max-w-lg leading-relaxed">
              Form meets function in every fiber. Sleek, distraction-free activewear engineered for performance.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products?categorySlug=womens"
                className="flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-black uppercase tracking-wider text-black transition-transform hover:scale-105 active:scale-95 shadow-md"
              >
                Shop Women
              </Link>
              <Link
                href="/products?categorySlug=mens"
                className="flex h-12 items-center justify-center rounded-full border border-white bg-black/20 px-8 text-sm font-black uppercase tracking-wider text-white backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
              >
                Shop Men
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Spotlight Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-store-fg-muted uppercase">
            Shop by category
          </span>
          <h2 className="font-heading text-xl font-black uppercase tracking-tight text-store-ink-strong sm:text-2xl mt-1">
            Browse Collections
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Women Category */}
          <Link
            href="/products?categorySlug=womens"
            className="group relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-store-surface border border-store-border/40 shadow-sm"
          >
            <LazyImage
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop"
              alt="Women's Apparel Category"
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="flex w-full items-center justify-between text-white">
                <span className="font-heading text-lg font-black uppercase tracking-wider">
                  Women&apos;s
                </span>
                <span className="relative overflow-hidden">
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>

          {/* Men Category */}
          <Link
            href="/products?categorySlug=mens"
            className="group relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-store-surface border border-store-border/40 shadow-sm"
          >
            <LazyImage
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop"
              alt="Men's Apparel Category"
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="flex w-full items-center justify-between text-white">
                <span className="font-heading text-lg font-black uppercase tracking-wider">
                  Men&apos;s
                </span>
                <span className="relative overflow-hidden">
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>

          {/* Accessories Category */}
          <Link
            href="/products?categorySlug=unisex"
            className="group relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-store-surface border border-store-border/40 shadow-sm"
          >
            <LazyImage
              src="https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?q=80&w=600&auto=format&fit=crop"
              alt="Accessories Category"
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="flex w-full items-center justify-between text-white">
                <span className="font-heading text-lg font-black uppercase tracking-wider">
                  Accessories
                </span>
                <span className="relative overflow-hidden">
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. New Arrivals Product Carousel */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-store-fg-muted uppercase">
              The latest drops
            </span>
            <h2 className="font-heading text-xl font-black uppercase tracking-tight text-store-ink-strong sm:text-2xl mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-black uppercase tracking-wider text-store-ink-strong hover:underline flex items-center gap-1 group"
          >
            View All Products
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="relative w-full px-1">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {carouselProducts.map((product) => {
                const primaryImg = product.imageUrls[0] ?? "";
                const hoverImg = product.imageUrls[1] ?? primaryImg;
                const isHovered = hoveredId === product._id;
                const isWishlisted =
                  hasHydrated && wishlist.isWishlisted(product._id);
                const categoryLabel = deriveCategoryLabel(product.categories);
                const slug = productSlugFromSourceUrl(product.sourceUrl);

                return (
                  <CarouselItem
                    key={product._id}
                    className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <article
                      className="flex flex-col gap-3 group relative cursor-pointer"
                      onMouseEnter={() => setHoveredId(product._id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Image Box */}
                      <div className="relative aspect-2/3 w-full overflow-hidden bg-store-surface rounded-2xl border border-store-border/40 shadow-sm">
                        {/* Wishlist */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            wishlist.toggle(product._id);
                          }}
                          className="absolute top-3 right-3 z-10 flex items-center justify-center size-9 rounded-full bg-store-paper hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                          aria-label={
                            isWishlisted
                              ? "Remove from Wishlist"
                              : "Add to Wishlist"
                          }
                          aria-pressed={isWishlisted}
                        >
                          <IconHeart
                            className={`size-5 transition-colors ${
                              isWishlisted
                                ? "fill-red-500 stroke-red-500 text-red-500 scale-110"
                                : "text-store-ink hover:text-red-500"
                            }`}
                          />
                        </button>

                        <Link
                          href={`/products/${slug}`}
                          onClick={() => cacheProduct(product)}
                          className="absolute inset-0 block overflow-hidden rounded-2xl"
                        >
                          <ProductCardImages
                            primarySrc={primaryImg}
                            hoverSrc={hoverImg}
                            title={product.title}
                            isHovered={isHovered}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            primaryClassName={`object-cover transition-[opacity,transform] duration-500 ease-out ${
                              isHovered
                                ? "opacity-0 scale-105"
                                : "opacity-100 scale-100"
                            }`}
                            hoverClassName={`object-cover transition-[opacity,transform] duration-500 ease-out delay-100 ${
                              isHovered
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-100"
                            }`}
                          />
                        </Link>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-1.5 px-1">
                        {categoryLabel && (
                          <span className="text-[10px] font-bold text-store-fg-muted uppercase tracking-wider">
                            {categoryLabel}
                          </span>
                        )}
                        <div className="flex items-start justify-between gap-4">
                          <Link
                            href={`/products/${slug}`}
                            onClick={() => cacheProduct(product)}
                            className="hover:underline flex-1"
                          >
                            <h3 className="font-black text-sm uppercase text-store-ink-strong tracking-tight line-clamp-2 leading-snug">
                              {product.title}
                            </h3>
                          </Link>
                          <span className="font-black text-sm text-store-ink-strong shrink-0">
                            {formatUsd(product.price.amount)}
                          </span>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {/* Arrows navigation - absolute matching UI */}
            <div className="hidden sm:block">
              <CarouselPrevious className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 size-10 rounded-full bg-store-paper border border-store-border shadow-md" />
              <CarouselNext className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 size-10 rounded-full bg-store-paper border border-store-border shadow-md" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* 4. Brand Editorial / Story Section */}
      <section className="grid grid-cols-1 gap-12 overflow-hidden rounded-2xl bg-store-surface border border-store-border/40 p-8 sm:p-12 md:grid-cols-2 md:items-center">
        {/* Left column: Image */}
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl shadow-sm">
          <LazyImage
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop"
            alt="Seamless performance activewear detail"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Right column: Content */}
        <div className="flex flex-col justify-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-store-fg-muted uppercase">
              Material matters
            </span>
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-store-ink-strong sm:text-3xl mt-1">
              THE SEAMLESS REVOLUTION
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-store-fg-muted">
            Crafted for absolute focus. Our seamless technology eliminates friction points so you can stretch, lift, and run with zero distractions. Engineered with responsive compression zones that support your muscles exactly where needed.
          </p>

          {/* Specifications list */}
          <ul className="flex flex-col gap-4 border-t border-store-border/80 pt-6">
            <li className="flex gap-4">
              <span className="font-heading text-xs font-black uppercase text-store-ink-strong tracking-wide w-32 shrink-0">
                Breathable Tech
              </span>
              <span className="text-xs text-store-fg-muted">
                Knit mesh panels strategically placed in high-sweat zones.
              </span>
            </li>
            <li className="flex gap-4">
              <span className="font-heading text-xs font-black uppercase text-store-ink-strong tracking-wide w-32 shrink-0">
                4-Way Stretch
              </span>
              <span className="text-xs text-store-fg-muted">
                Adapts seamlessly to your body shape without losing structure.
              </span>
            </li>
            <li className="flex gap-4">
              <span className="font-heading text-xs font-black uppercase text-store-ink-strong tracking-wide w-32 shrink-0">
                Zero Waste
              </span>
              <span className="text-xs text-store-fg-muted">
                Precision knit manufacturing significantly reduces fabric offcuts.
              </span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center rounded-full bg-store-ink-strong px-6 text-xs font-black uppercase tracking-wider text-store-paper transition-transform hover:scale-105 active:scale-95"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Trust Badges / Value Props */}
      <section className="border-y border-store-border/85 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center sm:text-left">
          {/* Badge 1 */}
          <div className="flex flex-col items-center sm:items-start gap-3 px-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-store-surface text-store-ink-strong">
              <Truck className="size-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-heading text-xs font-black uppercase tracking-wider text-store-ink-strong">
                Free Shipping
              </h4>
              <p className="text-xs text-store-fg-muted mt-1 leading-snug">
                Free standard delivery on all orders over $100.
              </p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex flex-col items-center sm:items-start gap-3 px-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-store-surface text-store-ink-strong">
              <RotateCcw className="size-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-heading text-xs font-black uppercase tracking-wider text-store-ink-strong">
                30-Day Returns
              </h4>
              <p className="text-xs text-store-fg-muted mt-1 leading-snug">
                Easy, worry-free return label generated in seconds.
              </p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex flex-col items-center sm:items-start gap-3 px-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-store-surface text-store-ink-strong">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-heading text-xs font-black uppercase tracking-wider text-store-ink-strong">
                Secure Checkout
              </h4>
              <p className="text-xs text-store-fg-muted mt-1 leading-snug">
                Encrypted transactions using industry-leading safety protocols.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
