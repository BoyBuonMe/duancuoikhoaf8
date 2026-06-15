"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ProductCardImages } from "@/components/product/ProductCardImages";
import Link from "next/link";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { IconHeart } from "@/components/icons";
import { useWishlist } from "@/features/wishlist";
import { useHasHydrated } from "@/shared/hooks";
import { formatUsd } from "@/shared/lib/format-money";
import {
  productSlugFromSourceUrl,
  useProductCache,
  type Product,
  fetchProductList,
} from "@/features/products";

import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type SortOption = "popular" | "low-to-high" | "high-to-low" | "newest";
type FilterGroupId =
  | "product"
  | "type"
  | "size"
  | "features"
  | "fit"
  | "activity"
  | "collection"
  | "color"
  | "pattern"
  | "price";
type FilterPanelId = "sort" | FilterGroupId;
type FilterSelection = Partial<Record<FilterGroupId, string[]>>;

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "popular", label: "Most Popular" },
  { id: "low-to-high", label: "Price: Low to High" },
  { id: "high-to-low", label: "Price: High to Low" },
  { id: "newest", label: "Newest First" },
];

const FILTER_GROUP_LABELS: { id: FilterGroupId; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "type", label: "Type" },
  { id: "size", label: "Size" },
  { id: "features", label: "Features" },
  { id: "fit", label: "Fit" },
  { id: "activity", label: "Activity" },
  { id: "collection", label: "Collection" },
  { id: "color", label: "Color" },
  { id: "pattern", label: "Pattern" },
  { id: "price", label: "Price" },
];

const PRICE_OPTIONS = [
  { id: "under-25", label: "Under $25", min: 0, max: 25 },
  { id: "25-50", label: "$25 - $50", min: 25, max: 50 },
  { id: "50-75", label: "$50 - $75", min: 50, max: 75 },
  { id: "75-plus", label: "$75+", min: 75, max: Number.POSITIVE_INFINITY },
];

const KEYWORD_FILTERS: Record<
  Extract<FilterGroupId, "features" | "fit" | "activity" | "pattern">,
  { id: string; label: string; keywords: string[] }[]
> = {
  features: [
    { id: "seamless", label: "Seamless", keywords: ["seamless"] },
    { id: "mesh", label: "Mesh", keywords: ["mesh"] },
    { id: "ribbed", label: "Ribbed", keywords: ["ribbed"] },
    { id: "baselayer", label: "Baselayer", keywords: ["baselayer"] },
    { id: "zip", label: "Zip", keywords: ["zip"] },
    { id: "pack", label: "Multipack", keywords: ["pack", "pk"] },
  ],
  fit: [
    { id: "oversized", label: "Oversized", keywords: ["oversized"] },
    { id: "slim", label: "Slim", keywords: ["slim"] },
    { id: "straight-leg", label: "Straight Leg", keywords: ["straight leg"] },
    { id: "cropped", label: "Cropped", keywords: ["cropped"] },
    { id: "regular", label: "Regular", keywords: ["regular"] },
  ],
  activity: [
    { id: "training", label: "Training", keywords: ["training", "baselayer"] },
    { id: "running", label: "Running", keywords: ["running", "run"] },
    { id: "lifting", label: "Lifting", keywords: ["lifting", "power"] },
    { id: "pilates", label: "Pilates", keywords: ["pilates"] },
    {
      id: "rest-day",
      label: "Rest Day",
      keywords: ["crest", "joggers", "hoodie"],
    },
  ],
  pattern: [
    { id: "graphic", label: "Graphic", keywords: ["graphic"] },
    { id: "marl", label: "Marl", keywords: ["marl"] },
    {
      id: "solid",
      label: "Solid",
      keywords: ["black", "white", "blue", "red"],
    },
    { id: "ribbed", label: "Ribbed", keywords: ["ribbed"] },
  ],
};

interface FilterOption {
  id: string;
  label: string;
}

interface SortPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  sortOption: SortOption;
  onSortChange: (opt: SortOption) => void;
}

function SortPanel({
  isOpen,
  onToggle,
  sortOption,
  onSortChange,
}: SortPanelProps) {
  return (
    <div className="border-b border-store-border pb-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2 text-left font-black text-xs uppercase tracking-widest text-store-ink-strong hover:text-store-fg-muted transition-colors"
      >
        <span>Sort By</span>
        {isOpen ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>
      <div
        className={`mt-2 flex flex-col gap-2 transition-all duration-300 origin-top overflow-hidden ${
          isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {SORT_OPTIONS.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-store-fg-muted hover:text-store-ink-strong transition-colors py-1"
          >
            <input
              type="radio"
              name="sortOption"
              value={opt.id}
              checked={sortOption === opt.id}
              onChange={() => onSortChange(opt.id)}
              className="size-4 accent-store-ink cursor-pointer"
            />
            <span
              className={
                sortOption === opt.id ? "text-store-ink-strong font-black" : ""
              }
            >
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface FilterPanelProps {
  id: FilterGroupId;
  label: string;
  isOpen: boolean;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: () => void;
  onSelectionChange: (groupId: FilterGroupId, value: string) => void;
}

function FilterPanel({
  id,
  label,
  isOpen,
  options,
  selectedValues,
  onToggle,
  onSelectionChange,
}: FilterPanelProps) {
  return (
    <div className="border-b border-store-border pb-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2 text-left font-black text-xs uppercase tracking-widest text-store-ink-strong hover:text-store-fg-muted transition-colors"
      >
        <span>{label}</span>
        {isOpen ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>
      <div
        className={`mt-2 flex flex-col gap-2 transition-all duration-300 origin-top overflow-hidden ${
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {options.length === 0 ? (
          <span className="py-1 text-xs font-bold text-store-fg-subtle">
            No options
          </span>
        ) : (
          options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-store-fg-muted hover:text-store-ink-strong transition-colors py-1"
            >
              <input
                type="checkbox"
                name={`${id}-${opt.id}`}
                value={opt.id}
                checked={selectedValues.includes(opt.id)}
                onChange={() => onSelectionChange(id, opt.id)}
                className="size-4 accent-store-ink cursor-pointer"
              />
              <span
                className={
                  selectedValues.includes(opt.id)
                    ? "text-store-ink-strong font-black"
                    : ""
                }
              >
                {opt.label}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

interface ProductListProps {
  products: Product[];
  total: number;
  categorySlug?: string;
}

function deriveCategoryLabel(categories: string[]): string {
  return categories.slice(1).filter(Boolean).join(" › ");
}

function formatOptionLabel(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getOptionId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function addOption(map: Map<string, string>, value?: string) {
  const normalized = value?.trim();
  if (!normalized) return;
  const id = getOptionId(normalized);
  if (!map.has(id)) map.set(id, formatOptionLabel(normalized));
}

function includesAnyKeyword(product: Product, keywords: string[]) {
  const searchable =
    `${product.title} ${product.categories.join(" ")}`.toLowerCase();
  return keywords.some((keyword) => searchable.includes(keyword.toLowerCase()));
}

function getProductFilterValues(
  product: Product,
  groupId: FilterGroupId,
): string[] {
  switch (groupId) {
    case "product":
      return product.categories[0] ? [getOptionId(product.categories[0])] : [];
    case "type":
      return product.categories.slice(2).map(getOptionId);
    case "size":
      return product.sizes?.map((size) => getOptionId(size.id)) ?? [];
    case "collection": {
      const collection = product.title.split(/[–-]/)[0]?.trim().split(" ")[0];
      return collection ? [getOptionId(collection)] : [];
    }
    case "color": {
      const titleColor = product.title.split(/[–-]/)[1]?.trim();
      return titleColor ? [getOptionId(titleColor)] : [];
    }
    case "price":
      return PRICE_OPTIONS.filter(
        (option) =>
          product.price.amount >= option.min &&
          product.price.amount < option.max,
      ).map((option) => option.id);
    default:
      return KEYWORD_FILTERS[groupId]
        .filter((option) => includesAnyKeyword(product, option.keywords))
        .map((option) => option.id);
  }
}

function buildFilterOptions(products: Product[]) {
  const optionMaps = new Map<FilterGroupId, Map<string, string>>(
    FILTER_GROUP_LABELS.map(({ id }) => [id, new Map<string, string>()]),
  );

  for (const product of products) {
    addOption(optionMaps.get("product")!, product.categories[0]);
    product.categories.slice(2).forEach((category) => {
      addOption(optionMaps.get("type")!, category);
    });
    product.sizes?.forEach((size) => {
      const sizeId = getOptionId(size.id);
      if (!optionMaps.get("size")!.has(sizeId)) {
        optionMaps.get("size")!.set(sizeId, size.label);
      }
    });

    const collection = product.title.split(/[–-]/)[0]?.trim().split(" ")[0];
    addOption(optionMaps.get("collection")!, collection);

    const titleColor = product.title.split(/[–-]/)[1]?.trim();
    addOption(optionMaps.get("color")!, titleColor);

    for (const groupId of ["features", "fit", "activity", "pattern"] as const) {
      KEYWORD_FILTERS[groupId].forEach((option) => {
        if (includesAnyKeyword(product, option.keywords)) {
          optionMaps.get(groupId)!.set(option.id, option.label);
        }
      });
    }
  }

  PRICE_OPTIONS.forEach((option) => {
    if (
      products.some(
        (product) =>
          product.price.amount >= option.min &&
          product.price.amount < option.max,
      )
    ) {
      optionMaps.get("price")!.set(option.id, option.label);
    }
  });

  return FILTER_GROUP_LABELS.reduce(
    (acc, { id }) => {
      acc[id] = Array.from(optionMaps.get(id)!.entries())
        .map(([optionId, label]) => ({ id: optionId, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
      return acc;
    },
    {} as Record<FilterGroupId, FilterOption[]>,
  );
}

function productMatchesFilters(
  product: Product,
  selectedFilters: FilterSelection,
) {
  return FILTER_GROUP_LABELS.every(({ id }) => {
    const selected = selectedFilters[id] ?? [];
    if (selected.length === 0) return true;
    const values = getProductFilterValues(product, id);
    return selected.some((value) => values.includes(value));
  });
}

export function ProductList({
  products,
  total,
  categorySlug,
}: ProductListProps) {
  const wishlist = useWishlist();
  const hasHydrated = useHasHydrated();
  const { cacheProduct, cacheProducts } = useProductCache();

  useEffect(() => {
    cacheProducts(products);
  }, [products, cacheProducts]);

  const [sortOption, setSortOption] = useState<SortOption>("popular");
  const [openPanels, setOpenPanels] = useState<Record<FilterPanelId, boolean>>({
    sort: true,
    product: true,
    type: true,
    size: false,
    features: false,
    fit: false,
    activity: false,
    collection: false,
    color: false,
    pattern: false,
    price: true,
  });
  const [selectedFilters, setSelectedFilters] = useState<FilterSelection>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Best Sellers Showcase states and ref
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [hoveredFeaturedId, setHoveredFeaturedId] = useState<string | null>(
    null,
  );
  const sliderRef = useRef<HTMLDivElement>(null);

  const gender = useMemo(() => {
    if (products && products.length > 0) {
      return products[0].categories[0]; // e.g. "Mens" or "Womens" or "Unisex"
    }
    if (categorySlug) {
      if (categorySlug.includes("women") || categorySlug.includes("womens"))
        return "Womens";
      if (categorySlug.includes("men") || categorySlug.includes("mens"))
        return "Mens";
    }
    return "Mens";
  }, [products, categorySlug]);

  const mainCategorySlug = useMemo(() => {
    if (gender === "Womens") return "women";
    if (gender === "Mens") return "men";
    return "accessories";
  }, [gender]);

  useEffect(() => {
    let active = true;
    const loadFeatured = async () => {
      try {
        const res = await fetchProductList({
          categorySlug: mainCategorySlug,
          limit: 100,
        });
        if (!active) return;
        if (res && res.products && res.products.length > 0) {
          const shuffled = [...res.products].sort(() => 0.5 - Math.random());
          setFeaturedProducts(shuffled.slice(0, 30));
        }
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      }
    };
    loadFeatured();
    return () => {
      active = false;
    };
  }, [mainCategorySlug]);

  const scrollPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const filterOptions = useMemo(() => buildFilterOptions(products), [products]);
  const activeFilterCount = Object.values(selectedFilters).reduce(
    (count, values) => count + (values?.length ?? 0),
    0,
  );

  const filtered = useMemo(
    () =>
      products.filter((product) =>
        productMatchesFilters(product, selectedFilters),
      ),
    [products, selectedFilters],
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortOption) {
      case "low-to-high":
        return arr.sort((a, b) => a.price.amount - b.price.amount);
      case "high-to-low":
        return arr.sort((a, b) => b.price.amount - a.price.amount);
      case "newest":
        return arr.sort(
          (a, b) =>
            new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime(),
        );
      default:
        return arr;
    }
  }, [filtered, sortOption]);

  function togglePanel(panelId: FilterPanelId) {
    setOpenPanels((current) => ({
      ...current,
      [panelId]: !current[panelId],
    }));
  }

  function toggleFilter(groupId: FilterGroupId, value: string) {
    setSelectedFilters((current) => {
      const values = current[groupId] ?? [];
      const nextValues = values.includes(value)
        ? values.filter((selected) => selected !== value)
        : [...values, value];

      if (nextValues.length === 0) {
        const next = { ...current };
        delete next[groupId];
        return next;
      }

      return { ...current, [groupId]: nextValues };
    });
  }

  const filterContent = (
    <>
      <SortPanel
        isOpen={openPanels.sort}
        onToggle={() => togglePanel("sort")}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />
      {FILTER_GROUP_LABELS.map((group) => (
        <FilterPanel
          key={group.id}
          id={group.id}
          label={group.label}
          isOpen={openPanels[group.id]}
          options={filterOptions[group.id]}
          selectedValues={selectedFilters[group.id] ?? []}
          onToggle={() => togglePanel(group.id)}
          onSelectionChange={toggleFilter}
        />
      ))}
    </>
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Gymshark Best Sellers Hero Banner */}
      {featuredProducts.length > 0 && (
        <div className="breadcrumb flex flex-col gap-6 pb-10 border-b border-store-border">
          {/* Hero Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-store-fg-muted">
                {gender === "Mens"
                  ? "MENS"
                  : gender === "Womens"
                    ? "WOMENS"
                    : "ACCESSORIES"}
              </span>
              <h1
                className="text-5xl sm:text-6xl md:text-7xl font-black uppercase italic leading-[0.85] tracking-tighter text-store-ink-strong"
                style={{ fontStretch: "condensed" }}
              >
                BEST SELLERS
              </h1>
              <span className="text-xs sm:text-sm font-medium text-store-fg-subtle">
                {sorted.length} / {total} Products
              </span>
              <p className="text-sm sm:text-base text-store-fg-muted max-w-2xl mt-1 leading-relaxed">
                Our community loves them, so will you. The perfect 2026 styles
                you&apos;ll be throwing on for every workout.
              </p>
            </div>
            {/* Slider Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-2 self-end mb-1">
              <button
                onClick={scrollPrev}
                className="flex items-center justify-center size-9 rounded-full border border-store-border hover:border-store-ink-strong hover:bg-store-surface transition-all active:scale-95 cursor-pointer"
                aria-label="Previous Products"
              >
                <ChevronLeft className="size-4 text-store-ink" />
              </button>
              <button
                onClick={scrollNext}
                className="flex items-center justify-center size-9 rounded-full border border-store-border hover:border-store-ink-strong hover:bg-store-surface transition-all active:scale-95 cursor-pointer"
                aria-label="Next Products"
              >
                <ChevronRight className="size-4 text-store-ink" />
              </button>
            </div>
          </div>

          {/* Featured Slider */}
          <div
            ref={sliderRef}
            className="flex gap-4 w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hidden pb-4"
          >
            <Carousel
              opts={{ loop: true, axis: "x" }}
              plugins={[
                AutoScroll({
                  startDelay: 3000,
                  speed: 1,
                  stopOnMouseEnter: true,
                  stopOnInteraction: false,
                }),
              ]}
              className="w-80"
            >
              <CarouselContent>
                {featuredProducts.map((product, idx) => {
                  const primaryImg = product.imageUrls[0] ?? "";
                  const hoverImg = product.imageUrls[1] ?? primaryImg;
                  const isHovered = hoveredFeaturedId === product._id;
                  const isWishlisted =
                    hasHydrated && wishlist.isWishlisted(product._id);
                  const slug = productSlugFromSourceUrl(product.sourceUrl);
                  const badge =
                    idx % 2 === 0 ? "MOST POPULAR" : idx === 1 ? "NEW" : null;

                  return (
                    <CarouselItem
                      key={`featured-${product._id}`}
                      className="w-70 sm:w-[320px] md:w-[23.5%] shrink-0 snap-start flex flex-col gap-3 group relative cursor-pointer scrollbar-hidden"
                      onMouseEnter={() => setHoveredFeaturedId(product._id)}
                      onMouseLeave={() => setHoveredFeaturedId(null)}
                    >
                      {/* Image Box */}
                      <div className="relative aspect-2/3 w-full overflow-hidden bg-store-surface rounded-2xl border border-store-border/40 shadow-sm">
                        {/* Badge */}
                        {badge && (
                          <span className="absolute top-3 left-3 z-10 bg-store-paper text-store-ink-strong text-[9px] font-black uppercase px-2.5 py-1.5 tracking-wider rounded-xs shadow-sm">
                            {badge}
                          </span>
                        )}

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
                            sizes="(max-width: 640px) 280px, 320px"
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
                        <div className="flex items-start justify-between gap-4">
                          <Link
                            href={`/products/${slug}`}
                            onClick={() => cacheProduct(product)}
                            className="hover:underline flex-1"
                          ></Link>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Mobile filter button */}
        <div className="w-full lg:hidden flex gap-2 sticky top-20 z-20 bg-store-paper/95 backdrop-blur-md py-2 border-b border-store-border">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 h-11 border border-store-border bg-store-paper rounded-lg text-sm font-bold uppercase tracking-wider hover:border-store-ink-strong transition-colors"
          >
            <SlidersHorizontal className="size-4" />
            Sort & Filter
          </button>
        </div>

        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col gap-6 w-64 shrink-0 sticky top-24 max-h-[80vh] overflow-y-auto pr-2">
          <div className="flex items-center justify-between border-b border-store-border pb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-store-ink-strong flex items-center gap-2">
              <SlidersHorizontal className="size-3.5" />
              Sort & Filter
            </h2>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setSelectedFilters({})}
                className="text-[10px] font-black uppercase tracking-widest text-store-fg-muted hover:text-store-ink-strong transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {filterContent}
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-store-surface-2 rounded-2xl border border-dashed border-store-border/80 w-full">
              <span className="text-3xl">🏜️</span>
              <p className="text-base font-bold text-store-ink-strong uppercase tracking-wider">
                No Products Found
              </p>
              <p className="text-xs text-store-fg-muted max-w-sm">
                {activeFilterCount > 0
                  ? "No products matched those filters. Try clearing a few options."
                  : "No products matched this category. Try browsing a different section."}
              </p>
              {activeFilterCount > 0 ? (
                <button
                  onClick={() => setSelectedFilters({})}
                  className="mt-2 bg-store-ink-strong text-store-paper px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg hover:bg-store-ink transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/products"
                  className="mt-2 bg-store-ink-strong text-store-paper px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg hover:bg-store-ink transition-all shadow-sm"
                >
                  View All Products
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-6 w-full">
              {sorted.map((product) => {
                const primaryImg = product.imageUrls[0] ?? "";
                const hoverImg = product.imageUrls[1] ?? primaryImg;
                const isHovered = hoveredId === product._id;
                const isWishlisted =
                  hasHydrated && wishlist.isWishlisted(product._id);
                const categoryLabel = deriveCategoryLabel(product.categories);
                const slug = productSlugFromSourceUrl(product.sourceUrl);

                return (
                  <article
                    key={product._id}
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                          className="hover:underline"
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sort Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-store-ink/40 backdrop-blur-xs"
            aria-label="Close"
          />
          <div className="relative w-full max-w-85 h-full bg-store-paper shadow-2xl flex flex-col p-5 z-10">
            <div className="flex items-center justify-between border-b border-store-border pb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-store-ink-strong flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                Sort & Filter
              </h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md hover:bg-store-surface"
                aria-label="Close"
              >
                <X className="size-5 text-store-ink" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">{filterContent}</div>
            <div className="border-t border-store-border pt-4">
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setSelectedFilters({})}
                  className="mb-2 w-full h-10 border border-store-border text-store-ink-strong text-[11px] font-black uppercase tracking-wider rounded-lg hover:border-store-ink-strong transition-all"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full h-11 bg-store-ink-strong text-store-paper text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-store-ink transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
