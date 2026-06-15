"use client";

import { useEffect, useState } from "react";
import { ProductCardImages } from "@/components/product/ProductCardImages";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconHeart } from "@/components/icons";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import {
  productSlugFromSourceUrl,
  useProductCache,
  type Product,
} from "@/features/products";
import { useWishlist } from "@/features/wishlist";
import { useHasHydrated } from "@/shared/hooks";
import { formatUsd } from "@/shared/lib/format-money";
import { cn } from "@/lib/utils";

type HomeBestsellersCarouselProps = {
  products: Product[];
};

const BADGES = ["", "Back In Stock", "Second Skin Feel"];

function BestsellersControls() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="flex size-10 items-center justify-center rounded-full text-store-ink transition-colors hover:bg-store-surface disabled:cursor-not-allowed disabled:text-store-fg-subtle"
        aria-label="Previous bestsellers"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="flex size-10 items-center justify-center rounded-full text-store-ink transition-colors hover:bg-store-surface disabled:cursor-not-allowed disabled:text-store-fg-subtle"
        aria-label="Next bestsellers"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

function BestsellerCard({
  product,
  index,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  product: Product;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const wishlist = useWishlist();
  const hasHydrated = useHasHydrated();
  const { cacheProduct } = useProductCache();
  const slug = productSlugFromSourceUrl(product.sourceUrl);
  const primaryImg = product.imageUrls[0] ?? "";
  const hoverImg = product.imageUrls[1] ?? primaryImg;
  const badge = BADGES[index % BADGES.length];
  const isWishlisted = hasHydrated && wishlist.isWishlisted(product._id);

  return (
    <article
      className="group relative flex flex-col gap-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={`/products/${slug}`}
        onClick={() => cacheProduct(product)}
        className="relative block aspect-4/5 overflow-hidden bg-store-surface"
        aria-label={product.title}
      >
        <ProductCardImages
          primarySrc={primaryImg}
          hoverSrc={hoverImg}
          title={product.title}
          isHovered={isHovered}
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 33vw, 20vw"
          primaryClassName={cn(
            "object-cover transition-[opacity,transform] duration-500 ease-out",
            isHovered ? "scale-105 opacity-0" : "scale-100 opacity-100",
          )}
          hoverClassName={cn(
            "object-cover transition-[opacity,transform] delay-100 duration-500 ease-out",
            isHovered ? "scale-100 opacity-100" : "scale-100 opacity-0",
          )}
        />
        {badge ? (
          <span className="absolute bottom-3 left-3 bg-store-paper px-3 py-1.5 text-xs font-black uppercase text-store-ink-strong">
            {badge}
          </span>
        ) : null}
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          wishlist.toggle(product._id);
        }}
        className={cn(
          "absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-store-paper text-store-ink-strong opacity-0 shadow-sm transition-all hover:scale-105 group-hover:opacity-100",
          isWishlisted && "opacity-100",
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isWishlisted}
      >
        <IconHeart
          className={cn(
            "size-5",
            isWishlisted && "fill-red-500 stroke-red-500 text-red-500",
          )}
        />
      </button>

      <div className="flex flex-col gap-1 text-sm">
        <Link
          href={`/products/${slug}`}
          onClick={() => cacheProduct(product)}
          className="line-clamp-2 text-store-ink-strong hover:underline"
        >
          {product.title}
        </Link>
        <p className="text-sm font-black text-store-ink-strong">
          {formatUsd(product.price.amount)}
        </p>
      </div>
    </article>
  );
}

export function HomeBestsellersCarousel({
  products,
}: HomeBestsellersCarouselProps) {
  const { cacheProducts } = useProductCache();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    cacheProducts(products);
  }, [cacheProducts, products]);

  if (products.length === 0) return null;

  return (
    <section className="bg-store-paper px-4 py-16 text-store-ink-strong sm:px-8 lg:px-12">
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <div className="mb-10 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black uppercase leading-none tracking-normal sm:text-3xl">
            Top 10 Women&apos;s Bestsellers
          </h2>
          <BestsellersControls />
        </div>

        <div className="overflow-hidden">
          <CarouselContent className="-ml-2">
            {products.map((product, index) => (
              <CarouselItem
                key={product._id}
                className="basis-[82%] pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
              >
                <BestsellerCard
                  product={product}
                  index={index}
                  isHovered={hoveredId === product._id}
                  onMouseEnter={() => setHoveredId(product._id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
}
