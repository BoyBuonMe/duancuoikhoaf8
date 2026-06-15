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
  fetchProductBySlug,
  productSlugFromSourceUrl,
  useProductCache,
  type Product,
} from "@/features/products";
import { useWishlist } from "@/features/wishlist";
import { useHasHydrated } from "@/shared/hooks";
import { formatUsd } from "@/shared/lib/format-money";
import { cn } from "@/lib/utils";

type HomeProductCarouselProps = {
  products: Product[];
};

function deriveFit(product: Product) {
  const source =
    `${product.title} ${product.categories.join(" ")}`.toLowerCase();
  if (source.includes("oversized")) return "Oversized Fit";
  if (source.includes("slim")) return "Slim Fit";
  if (source.includes("regular")) return "Regular Fit";
  if (source.includes("relaxed")) return "Relaxed Fit";
  if (source.includes("compression")) return "Compression Fit";
  return "Regular Fit";
}

function getColorText(product: Product) {
  return product.title.split(/[\u2013-]/)[1]?.trim() ?? "One color";
}

function CarouselControls() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="flex size-10 items-center justify-center rounded-full bg-store-surface text-store-ink transition-colors hover:bg-store-border disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Previous products"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="flex size-10 items-center justify-center rounded-full bg-store-ink-strong text-store-paper transition-colors hover:bg-store-ink disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Next products"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

function ProductCarouselCard({
  product,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  product: Product;
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
  const colorText = getColorText(product);
  const isWishlisted = hasHydrated && wishlist.isWishlisted(product._id);

  return (
    <article
      className="group flex flex-col gap-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative aspect-3/4 overflow-hidden bg-store-surface">
        <Link
          href={`/products/${slug}`}
          onClick={() => cacheProduct(product)}
          className="absolute inset-0 block overflow-hidden"
          aria-label={product.title}
        >
        <ProductCardImages
          primarySrc={primaryImg}
          hoverSrc={hoverImg}
          title={product.title}
          isHovered={isHovered}
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
          primaryClassName={cn(
            "object-cover transition-[opacity,transform] duration-500 ease-out",
            isHovered ? "scale-105 opacity-0" : "scale-100 opacity-100",
          )}
          hoverClassName={cn(
            "object-cover transition-[opacity,transform] delay-100 duration-500 ease-out",
            isHovered ? "scale-100 opacity-100" : "scale-100 opacity-0",
          )}
        />
        </Link>

        <span className="absolute bottom-3 left-3 bg-store-paper px-2.5 py-1.5 text-xs font-black uppercase text-store-ink-strong">
          New
        </span>
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
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <Link
          href={`/products/${slug}`}
          onClick={() => cacheProduct(product)}
          className="line-clamp-2 text-store-ink-strong hover:underline"
        >
          {product.title}
        </Link>
        <p className="text-store-fg-muted">{deriveFit(product)}</p>
        <p className="line-clamp-1 text-store-fg-muted">{colorText}</p>
        <p className="text-sm font-black text-store-ink-strong">
          {formatUsd(product.price.amount)}
        </p>
      </div>
    </article>
  );
}

export function HomeProductCarousel({ products }: HomeProductCarouselProps) {
  const { cacheProduct, cacheProducts } = useProductCache();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [productsById, setProductsById] = useState<Record<string, Product>>({});

  useEffect(() => {
    cacheProducts(products);
  }, [cacheProducts, products]);

  useEffect(() => {
    let active = true;

    async function loadProductColors() {
      const entries = await Promise.all(
        products.map(async (product) => {
          if (product.sizes?.length) {
            return [product._id, product] as const;
          }

          try {
            const slug = productSlugFromSourceUrl(product.sourceUrl);
            const { product: enrichedProduct } = await fetchProductBySlug(slug);
            return [product._id, enrichedProduct] as const;
          } catch {
            return [product._id, product] as const;
          }
        }),
      );

      if (!active) return;

      const nextProductsById = Object.fromEntries(entries);
      setProductsById(nextProductsById);
      entries.forEach(([, product]) => cacheProduct(product));
    }

    loadProductColors();

    return () => {
      active = false;
    };
  }, [cacheProduct, products]);

  if (products.length === 0) return null;

  return (
    <section className="bg-store-paper px-4 py-8 text-store-ink-strong sm:px-8 lg:px-12">
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-black uppercase leading-none tracking-normal sm:text-3xl">
              New In: GSLC
            </h2>
            <Link
              href="/products"
              className="text-sm font-bold leading-none underline underline-offset-4 hover:text-store-fg-muted"
            >
              View All
            </Link>
          </div>
          <CarouselControls />
        </div>

        <div className="overflow-hidden">
          <CarouselContent className="-ml-1.5 sm:-ml-2">
            {products.map((product) => {
              const displayProduct = productsById[product._id] ?? product;

              return (
                <CarouselItem
                  key={product._id}
                  className="basis-[82%] pl-1.5 sm:basis-1/2 sm:pl-2 lg:basis-1/4"
                >
                  <ProductCarouselCard
                    product={displayProduct}
                    isHovered={hoveredId === product._id}
                    onMouseEnter={() => setHoveredId(product._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
}
