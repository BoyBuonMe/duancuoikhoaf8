"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MAX_VISIBLE_PAGES = 7;

function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), totalPages);
}

function usePagination<T>(items: T[], limit = 9) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const page = clampPage(Number(searchParams.get("page")), totalPages);

  const startIndex = (page - 1) * limit;
  const currentItems = items.slice(startIndex, startIndex + limit);

  const visiblePages = Math.min(totalPages, MAX_VISIBLE_PAGES);
  const firstPage = Math.max(1, page - Math.floor(visiblePages / 2));
  const lastStartPage = Math.max(1, totalPages - visiblePages + 1);
  const startPage = Math.min(firstPage, lastStartPage);
  const pageNumbers = Array.from(
    { length: visiblePages },
    (_, index) => startPage + index,
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const safePage = clampPage(newPage, totalPages);
      const next = new URLSearchParams(searchParams.toString());
      next.set("page", String(safePage));
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pathname, router, searchParams, totalPages],
  );

  return { page, totalPages, currentItems, pageNumbers, handlePageChange };
}

export default usePagination;
