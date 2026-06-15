"use client";

import { LazyImage } from "@/components/product/LazyImage";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { IconSearch } from "@/components/icons";
import {
  productSlugFromSourceUrl,
  useProductCache,
} from "@/features/products";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import { useDebouncedValue } from "@/shared/hooks";
import { formatUsd } from "@/shared/lib/format-money";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 750;

type HeaderSearchProps = {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  onClose?: () => void;
  showSubmitButton?: boolean;
};

export function HeaderSearch({
  placeholder = "What are you looking for tod…",
  className,
  inputClassName,
  autoFocus = false,
  onClose,
  showSubmitButton = false,
}: HeaderSearchProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { cacheProduct } = useProductCache();

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const trimmedQuery = debouncedQuery.trim();
  const isDebouncing = query.trim() !== debouncedQuery.trim();
  const { results, loading, error } = useProductSearch(trimmedQuery);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleSelect = () => {
    setFocused(false);
    setQuery("");
    onClose?.();
  };

  const dropdownVisible =
    focused && trimmedQuery.length > 0 && !isDebouncing;
  const showLoading = loading || isDebouncing;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) {
            handleSelect();
          }
        }}
      >
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-store-fg-muted" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className={cn(
            "h-10 w-full rounded-full border border-transparent bg-store-surface py-2 pl-10 pr-4 text-sm text-store-ink outline-none ring-store-ink/5 placeholder:text-store-fg-muted focus:border-store-border-strong focus:bg-store-paper focus:ring-2",
            showSubmitButton && "h-11 pr-4",
            inputClassName,
          )}
          aria-label="Search products"
          aria-expanded={dropdownVisible}
          aria-controls={dropdownVisible ? listboxId : undefined}
          aria-autocomplete="list"
          role="combobox"
        />
        {showSubmitButton ? (
          <button
            type="submit"
            className="sr-only"
            tabIndex={-1}
          >
            Search
          </button>
        ) : null}
      </form>

      {dropdownVisible ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-store-border bg-store-paper shadow-lg"
        >
          {showLoading ? (
            <p className="px-4 py-3 text-sm text-store-fg-muted">
              Searching...
            </p>
          ) : error ? (
            <p className="px-4 py-3 text-sm text-red-600">{error}</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-store-fg-muted">
              No products found for &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((product) => {
                const slug = productSlugFromSourceUrl(product.sourceUrl);
                const image = product.imageUrls[0];

                return (
                  <li key={product._id}>
                    <Link
                      href={`/products/${slug}`}
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        cacheProduct(product);
                        handleSelect();
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-store-surface"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-store-surface">
                        {image ? (
                          <LazyImage
                            src={image}
                            alt={product.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-store-ink-strong">
                          {product.title}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold tabular-nums text-store-ink">
                          {formatUsd(product.price.amount)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
