import { productListPathForCategory } from "@/features/products/lib/category-path";
import { DEFAULT_NAV } from "@/lib/default-nav";
import type { NavItem } from "@/types/nav";

export interface Category {
  name: string;
  slug: string;
  level: number;
  parentSlug: string | null;
  path: string;
  pathSegments: string[];
  productCount: number;
}

/** Map top-level category slugs to the nav label + href */
const TOP_LEVEL_MAP: Record<string, { label: string; href: string }> = {
  women: { label: "Women", href: "/women" },
  men: { label: "Men", href: "/men" },
  accessories: { label: "Accessories", href: "/accessories" },
};

/** Static Explore nav item — not driven by categories */
const EXPLORE_ITEM: NavItem = {
  label: "Explore",
  href: "/explore",
  subItems: [
    { label: "Women's Guides", href: "/explore/womens-guides" },
    { label: "Men's Guides", href: "/explore/mens-guides" },
    { label: "Blog", href: "/explore/blog" },
    { label: "Training", href: "/explore/training" },
  ],
};

/** Minimum catalog top-level items (Women/Men/Accessories) before trusting API nav. */
const MIN_CATALOG_NAV_ITEMS = 2;

/**
 * Normalize NEXT_PUBLIC_BASE_API whether it is `http://host:3001` or `http://host:3001/api`.
 */
export function getApiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_API ?? "http://localhost:3001";
  return raw.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

/**
 * Build SiteHeader nav items from a flat categories list.
 * Top-level nav  = level-0 slugs in TOP_LEVEL_MAP.
 * Sub-items      = level-1 categories (Apparel, Accessories…) that are direct children.
 * Children       = level-2 categories (Leggings, Shorts…) under each sub-item.
 */
export function buildNavFromCategories(categories: Category[]): NavItem[] {
  const navItems: NavItem[] = [];

  for (const [topSlug, mapping] of Object.entries(TOP_LEVEL_MAP)) {
    const topCat = categories.find((c) => c.slug === topSlug);
    if (!topCat) continue;

    const subItems = categories
      .filter((c) => c.level === 1 && c.parentSlug === topCat.slug)
      .map((sub) => {
        const children = categories
          .filter(
            (c) =>
              c.level === 2 &&
              c.parentSlug === sub.slug &&
              c.productCount > 0,
          )
          .map((child) => ({
            label: child.name,
            href: productListPathForCategory(child, categories),
          }));

        return {
          label: sub.name,
          href: `/categories/${sub.slug}`,
          ...(children.length > 0 && { children }),
        };
      });

    navItems.push({ label: mapping.label, href: mapping.href, subItems });
  }

  navItems.push(EXPLORE_ITEM);
  return navItems;
}

/**
 * Hybrid resolver: keep hardcoded nav unless API returns a usable catalog menu.
 */
export function resolveNavItems(apiNav: NavItem[] | null): NavItem[] {
  if (!apiNav?.length) return DEFAULT_NAV;

  const catalogItems = apiNav.filter((item) => item.href !== "/explore");
  if (catalogItems.length < MIN_CATALOG_NAV_ITEMS) return DEFAULT_NAV;

  return apiNav;
}

/** Server-side fetch of the flat categories catalog. */
export async function fetchCategories(): Promise<Category[]> {
  const baseUrl = getApiOrigin();

  try {
    const res = await fetch(`${baseUrl}/api/categories`, {
      next:
        process.env.NODE_ENV === "production"
          ? { revalidate: 3600 }
          : { revalidate: 0 },
    });

    if (!res.ok) return [];

    const { categories }: { categories: Category[] } = await res.json();
    return categories ?? [];
  } catch {
    return [];
  }
}

/** Server-side fetch — returns null when API unavailable (caller uses resolveNavItems). */
export async function fetchNavItemsFromApi(): Promise<NavItem[] | null> {
  const baseUrl = getApiOrigin();

  try {
    const res = await fetch(`${baseUrl}/api/categories`, {
      next:
        process.env.NODE_ENV === "production"
          ? { revalidate: 3600 }
          : { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`categories API ${res.status}`);

    const { categories }: { categories: Category[] } = await res.json();
    return buildNavFromCategories(categories);
  } catch (err) {
    console.warn(
      "[nav] Could not fetch categories, using default navigation:",
      err,
    );
    return null;
  }
}

/** @deprecated Use fetchNavItemsFromApi + resolveNavItems */
export async function fetchNavItems(): Promise<NavItem[]> {
  const apiNav = await fetchNavItemsFromApi();
  return resolveNavItems(apiNav);
}
