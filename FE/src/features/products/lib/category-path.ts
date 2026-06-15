import type { Category } from "@/lib/nav-categories";

export const CATALOG_ROOTS = new Set(["women", "men", "accessories"]);

export function isCatalogPath(segments: string[]): boolean {
  return segments.length >= 1 && CATALOG_ROOTS.has(segments[0]);
}

/** Top-level catalog slug when BE categories are unavailable. */
export function fallbackCatalogCategorySlug(segments: string[]): string | null {
  if (segments.length === 1 && CATALOG_ROOTS.has(segments[0])) {
    return segments[0];
  }
  return null;
}

export function groupSegmentFromSlug(parentSlug: string, topSlug: string): string {
  const prefix = `${topSlug}-`;
  return parentSlug.startsWith(prefix)
    ? parentSlug.slice(prefix.length)
    : parentSlug;
}

export function leafSegmentFromSlug(childSlug: string, parentSlug: string): string {
  const prefix = `${parentSlug}-`;
  return childSlug.startsWith(prefix)
    ? childSlug.slice(prefix.length)
    : childSlug;
}

function belongsToTop(
  category: Category,
  categories: Category[],
  topSlug: string,
): boolean {
  let current = categories.find((c) => c.slug === category.parentSlug);
  while (current) {
    if (current.slug === topSlug) return true;
    current = current.parentSlug
      ? categories.find((c) => c.slug === current!.parentSlug)
      : undefined;
  }
  return false;
}

/** Build a clean URL path for a catalog category (e.g. /products/men/shorts). */
export function productListPathForCategory(
  category: Category,
  categories: Category[],
): string {
  if (category.level === 0) {
    return `/products/${category.slug}`;
  }

  if (category.level === 2) {
    const parent = categories.find((c) => c.slug === category.parentSlug);
    const top = parent
      ? categories.find((c) => c.slug === parent.parentSlug)
      : undefined;
    if (!parent || !top) return `/products/${category.slug}`;

    const leaf = leafSegmentFromSlug(category.slug, parent.slug);
    if (leaf === "all") {
      return `/products/${top.slug}/${groupSegmentFromSlug(parent.slug, top.slug)}`;
    }
    return `/products/${top.slug}/${leaf}`;
  }

  return `/products/${category.slug}`;
}

/**
 * Resolve a URL path like ["men", "shorts"] to the BE category slug
 * (e.g. "men-products-shorts") using the categories catalog.
 */
export function resolveCategorySlugFromPath(
  segments: string[],
  categories: Category[],
): string | null {
  if (segments.length === 0) return null;

  const topSlug = segments[0];
  const topCat = categories.find((c) => c.slug === topSlug && c.level === 0);
  if (!topCat) return null;

  if (segments.length === 1) return topSlug;

  const second = segments[1];

  if (segments.length === 2) {
    const leafMatches = categories.filter(
      (c) =>
        c.level === 2 &&
        c.productCount > 0 &&
        belongsToTop(c, categories, topSlug) &&
        leafSegmentFromSlug(c.slug, c.parentSlug!) === second,
    );
    if (leafMatches.length > 0) {
      return leafMatches
        .sort((a, b) => {
          if (b.productCount !== a.productCount) {
            return b.productCount - a.productCount;
          }
          const score = (slug: string) =>
            slug.includes("-products-") ? 2 : slug.includes("-trending-") ? 1 : 0;
          return score(b.slug) - score(a.slug);
        })[0].slug;
    }

    const level1 = categories.find(
      (c) =>
        c.level === 1 &&
        c.parentSlug === topSlug &&
        groupSegmentFromSlug(c.slug, topSlug) === second,
    );
    if (level1) {
      const children = categories.filter(
        (c) =>
          c.level === 2 &&
          c.parentSlug === level1.slug &&
          c.productCount > 0,
      );
      const preferred =
        children.find((c) => c.slug.endsWith("-all")) ??
        children.sort((a, b) => b.productCount - a.productCount)[0];
      return preferred?.slug ?? null;
    }

    return null;
  }

  const group = segments[1];
  const leaf = segments[2];
  const level1 = categories.find(
    (c) =>
      c.level === 1 &&
      c.parentSlug === topSlug &&
      groupSegmentFromSlug(c.slug, topSlug) === group,
  );
  if (!level1) return null;

  const level2 = categories.find(
    (c) =>
      c.level === 2 &&
      c.parentSlug === level1.slug &&
      leafSegmentFromSlug(c.slug, level1.slug) === leaf,
  );
  return level2?.slug ?? null;
}
