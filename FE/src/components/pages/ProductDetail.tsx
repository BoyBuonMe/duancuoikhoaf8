"use client";

import { useState, useRef, useEffect } from "react";
import { LazyImage } from "@/components/product/LazyImage";
import Link from "next/link";
import {
  fetchProductBySlug,
  productSlugFromSourceUrl,
  useCachedProduct,
  rateProductApi,
} from "@/features/products";
import type { Product } from "@/features/products/model/product.types";
import { useAppDispatch } from "@/store/hooks";
import { cacheProduct } from "@/features/products/model/products.slice";
import { useCart } from "@/features/cart";
import { useAuth } from "@/features/auth/model/useAuth";
import { useWishlist } from "@/features/wishlist";
import { useRouter } from "next/navigation";
import { useHasHydrated } from "@/shared/hooks";
import { useToast } from "@/shared/context/ToastContext";

function IconHeart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 7-3 4.5 4.5 0 0 1 7 3c0 5.65-7 10-7 10Z" />
    </svg>
  );
}

function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const PLACEHOLDER_SIZES = [
  { id: "xs", label: "XS", inStock: true },
  { id: "s", label: "S", inStock: true },
  { id: "m", label: "M", inStock: true },
  { id: "l", label: "L", inStock: true },
  { id: "xl", label: "XL", inStock: false },
  { id: "xxl", label: "XXL", inStock: true },
];

type ProductDetailProps = {
  slug: string;
  initialProduct?: Product | null;
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function categoryLabel(categories: string[]) {
  return categories.slice(1).filter(Boolean).join(" · ");
}

export function ProductDetail({
  slug,
  initialProduct = null,
}: ProductDetailProps) {
  const cachedProduct = useCachedProduct(slug);
  const product = cachedProduct ?? initialProduct;
  const dispatch = useAppDispatch();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const toast = useToast();

  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleRateProduct = async (rating: number) => {
    if (!product) return;
    try {
      const stats = await rateProductApi(product._id, rating);
      setUserRating(rating);
      dispatch(
        cacheProduct({
          ...product,
          ratingAverage: stats.ratingAverage,
          ratingCount: stats.ratingCount,
        }),
      );
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
    } catch {
      toast.error("Không thể gửi đánh giá sản phẩm.");
    }
  };

  // Seed cache from server-fetched product, then refresh sizes client-side.
  useEffect(() => {
    if (initialProduct) {
      dispatch(cacheProduct(initialProduct));
    }
  }, [initialProduct, dispatch]);

  useEffect(() => {
    fetchProductBySlug(slug)
      .then(({ product: full }) => dispatch(cacheProduct(full)))
      .catch(() => {
        // Non-critical: fall back to cached or server-provided product
      });
  }, [slug, dispatch]);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    "description",
  );
  const [scrollProgress, setScrollProgress] = useState(0);

  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (thumbnailScrollRef.current && scrollThumbRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        thumbnailScrollRef.current;
      const trackHeight = scrollHeight - clientHeight;
      const progress = trackHeight > 0 ? (scrollTop / trackHeight) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  function handleAddToBag() {
    if (!isAuthenticated) {
      router.push("/account/login");
      return;
    }
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    if (!product) return;

    const displaySizes =
      product.sizes && product.sizes.length > 0
        ? product.sizes
        : PLACEHOLDER_SIZES.map((s) => ({
            ...s,
            sku: `${product._id}-${s.id}`,
          }));

    const sizeObj = displaySizes.find((s) => s.id === selectedSize);
    const sku = sizeObj?.sku ?? `${product._id}-${selectedSize}`;

    addItem({
      sku,
      name: product.title,
      image: product.imageUrls[0] ?? "",
      variantLabel: sizeObj?.label ?? selectedSize.toUpperCase(),
      productSlug: productSlugFromSourceUrl(product.sourceUrl),
      quantity: 1,
      unitPrice: product.price,
    });

    setSizeError(false);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-base font-bold uppercase tracking-wider text-store-ink-strong">
          Product not found
        </p>
        <p className="text-sm text-store-fg-muted max-w-sm">
          Open this product from the product list so its data is available.
        </p>
        <Link
          href="/products"
          className="mt-2 bg-store-ink-strong text-store-paper px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg hover:bg-store-ink transition-all"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const gallery = product.imageUrls.length > 0 ? product.imageUrls : [""];
  const subtitle = categoryLabel(product.categories);
  const priceLabel = formatPrice(product.price.amount, product.price.currency);
  const isProductWishlisted = hasHydrated && wishlist.isWishlisted(product._id);

  const displaySizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : PLACEHOLDER_SIZES.map((s) => ({
          ...s,
          sku: `${product._id}-${s.id}`,
        }));

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-store-fg-subtle">
        <Link href="/" className="hover:text-store-ink">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-store-ink">
          Products
        </Link>
        <span>/</span>
        <span className="text-store-ink-strong line-clamp-1">
          {product.title}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16">
        {/* Left: Gallery & Rating */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative gallery flex gap-3 max-h-150">
            <div className="hidden md:flex flex-col items-center justify-center w-20 shrink-0 absolute top-2/5 left-2 h-50 rounded-xl z-10">
              <div className="flex-1 flex items-center justify-center p-4 my-3 relative rounded-full bg-store-ink">
                <div
                  ref={scrollTrackRef}
                  className="w-2 h-35 bg-store-fg-muted rounded-full border relative"
                >
                  <div
                    ref={scrollThumbRef}
                    style={{
                      top: `${scrollProgress}%`,
                      transform: `translate(-50%, -${scrollProgress}%)`,
                    }}
                    className="thumbScroll absolute left-1/2 h-10 w-2 bg-store-paper rounded-full transition-transform duration-150 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div
              ref={thumbnailScrollRef}
              onScroll={handleScroll}
              className="a grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 flex-1 overflow-auto scrollbar-hidden"
            >
              {gallery.map((src, i) => (
                <div key={i} className="relative aspect-2/3 bg-store-surface">
                  {src && (
                    <LazyImage
                      src={src}
                      alt={`${product.title} ${i + 1}`}
                      fill
                      eager={i === 0}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="min-h-full min-w-full object-cover transition-transform duration-500 hover:scale-101"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist Rating Summary & Interactive Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-store-border/40 pt-4 px-1">
            <div className="flex items-center gap-2 text-store-ink">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => {
                  const ratingVal = product.ratingAverage ?? 0;
                  const isFilled = i < Math.round(ratingVal);
                  return (
                    <IconStar
                      key={i}
                      filled={isFilled}
                      className={`size-4.5 ${
                        isFilled ? "text-amber-500 fill-amber-500" : "text-store-fg-subtle"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-sm font-black text-store-ink-strong">
                {product.ratingAverage ? product.ratingAverage.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs text-store-fg-muted font-bold tracking-tight">
                ({product.ratingCount ?? 0} {product.ratingCount === 1 ? "đánh giá" : "đánh giá"})
              </span>
            </div>

            {/* User rating submission */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-store-fg-muted">Đánh giá sản phẩm:</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    const isHoveredOrSelected = starVal <= (hoveredRating ?? userRating ?? 0);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleRateProduct(starVal)}
                        onMouseEnter={() => setHoveredRating(starVal)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="p-0.5 cursor-pointer text-store-fg-subtle hover:text-amber-400 transition-colors"
                        aria-label={`Đánh giá ${starVal} sao`}
                      >
                        <IconStar
                          filled={isHoveredOrSelected}
                          className={`size-4.5 transition-transform duration-100 hover:scale-110 ${isHoveredOrSelected ? "text-amber-400 fill-amber-400" : "text-store-fg-subtle"}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Link
                href="/account/login"
                className="text-[10px] font-black uppercase tracking-wider text-store-fg-muted hover:text-store-ink underline underline-offset-4"
              >
                Đăng nhập để đánh giá
              </Link>
            )}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:w-95 xl:w-110 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div className="bg-store-surface-2 px-4 py-2 border-l-4 border-store-ink-strong">
              <p className="text-[11px] font-bold uppercase tracking-tight">
                Free standard delivery on orders over $100
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-black uppercase italic leading-[0.9] tracking-tighter text-store-ink-strong xl:text-4xl">
                  {product.title}
                </h1>
                <button
                  onClick={() => wishlist.toggle(product._id)}
                  aria-label={
                    isProductWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  aria-pressed={isProductWishlisted}
                  className="group rounded-full border border-store-border p-2.5 transition-colors hover:border-store-ink-strong"
                >
                  <IconHeart
                    className={`size-6 transition-transform group-hover:scale-110 ${
                      isProductWishlisted
                        ? "fill-red-500 stroke-red-500"
                        : "text-store-ink"
                    }`}
                  />
                </button>
              </div>
              {subtitle && (
                <p className="text-sm font-medium text-store-fg-muted">
                  {subtitle}
                </p>
              )}
              <p className="text-2xl font-black text-store-ink-strong pt-2">
                {priceLabel}
              </p>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-widest text-store-ink-strong">
                  Select Size
                </p>
                <button className="text-[11px] font-bold uppercase tracking-widest underline underline-offset-4 hover:text-store-fg-muted">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {displaySizes.map((size) => (
                  <button
                    key={size.id}
                    disabled={!size.inStock}
                    onClick={() => {
                      setSelectedSize(size.id);
                      setSizeError(false);
                    }}
                    className={`flex h-12 items-center justify-center border text-sm font-bold uppercase transition-all duration-200 ${
                      selectedSize === size.id
                        ? "border-store-ink-strong bg-store-ink-strong text-store-paper"
                        : "border-store-border bg-store-paper hover:border-store-ink-strong"
                    } ${!size.inStock ? "relative overflow-hidden opacity-30 cursor-not-allowed bg-store-surface after:absolute after:h-px after:w-[120%] after:rotate-35 after:bg-store-fg-muted" : ""}`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-xs font-semibold text-destructive">
                  Please select a size before adding to bag.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToBag}
                className="w-full bg-store-accent hover:bg-store-accent-hover text-store-on-accent h-16 text-sm font-black uppercase tracking-[0.2em] transition-all rounded shadow-sm active:scale-[0.98]"
              >
                {addedFeedback ? "Added!" : "Add to Bag"}
              </button>
              <div className="flex items-center justify-center gap-6 py-2 border-y border-store-border/50">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase text-store-fg-muted">
                    In stock
                  </span>
                </div>
                <div className="h-4 w-px bg-store-border" />
                <span className="text-[11px] font-bold uppercase text-store-fg-muted">
                  Free Returns
                </span>
              </div>
            </div>

            <div className="divide-y divide-store-border border-t border-store-border">
              {[
                {
                  id: "description",
                  title: "Product Features",
                  content: product.title,
                },
                {
                  id: "delivery",
                  title: "Delivery & Returns",
                  content:
                    "We offer free standard delivery on all orders over $100. Returns are free and easy within 30 days of purchase.",
                },
                {
                  id: "fabric",
                  title: "Composition & Care",
                  content:
                    "Premium heavyweight fabric. 95% Organic Cotton, 5% Elastane. Machine wash at 30°C. Do not tumble dry.",
                },
              ].map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-store-fg-muted"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-store-ink-strong">
                      {item.title}
                    </span>
                    <IconChevronDown
                      className={`size-5 transition-transform duration-300 ${
                        activeAccordion === item.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      activeAccordion === item.id
                        ? "grid-rows-[1fr] opacity-100 pb-6"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm leading-relaxed text-store-fg-muted">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
