import type { NavItem } from "@/types/nav";

/** Fallback navigation when categories API is unavailable or incomplete. */
export const DEFAULT_NAV: NavItem[] = [
  {
    label: "Women",
    href: "/women",
    subItems: [
      {
        label: "Trending",
        href: "/women/trending",
        children: [
          { label: "New Product Drops", href: "/women/trending/new-drops" },
          { label: "Best Sellers", href: "/women/trending/best-sellers" },
          { label: "Form | Now Live", href: "/women/trending/form-now-live" },
          { label: "Everyday Seamless", href: "/women/trending/everyday-seamless" },
          { label: "Spring Looks", href: "/women/trending/spring-looks" },
          { label: "Pilates", href: "/women/trending/pilates" },
        ],
      },
      {
        label: "Leggings",
        href: "/women/leggings",
        children: [
          { label: "All Leggings", href: "/products/women/leggings" },
          { label: "Full Length", href: "/products/women/full-length" },
          { label: "High Waisted", href: "/products/women/high-waisted" },
          { label: "Seamless Leggings", href: "/products/women/seamless" },
        ],
      },
      {
        label: "Products",
        href: "/women/products",
        children: [
          { label: "All Products", href: "/products/women/products" },
          { label: "Sports Bras", href: "/products/women/sports-bras" },
          { label: "Shorts", href: "/products/women/shorts" },
          { label: "Pullovers", href: "/products/women/pullovers" },
          { label: "SS Tops", href: "/products/women/ss-tops" },
        ],
      },
      {
        label: "Accessories",
        href: "/women/accessories",
        children: [
          { label: "All Accessories", href: "/products/women/accessories" },
          { label: "Socks", href: "/products/women/all-socks" },
          { label: "Headwear", href: "/products/women/headwear" },
          { label: "Bags", href: "/products/women/bags" },
        ],
      },
      { label: "Last Chance", href: "/women/last-chance" },
      { label: "Explore", href: "/women/explore" },
    ],
  },
  {
    label: "Men",
    href: "/men",
    subItems: [
      {
        label: "Trending",
        href: "/men/trending",
        children: [
          { label: "New Product Drops", href: "/men/trending/new-drops" },
          { label: "Best Sellers", href: "/men/trending/best-sellers" },
          { label: "Shorts", href: "/products/men/trending/shorts" },
          { label: "Running", href: "/men/trending/running" },
        ],
      },
      {
        label: "T-Shirts & Tops",
        href: "/men/tops",
        children: [
          { label: "T-Shirts & Tops", href: "/products/men/tshirts-tops" },
          { label: "Tank Tops", href: "/products/men/tanks" },
          { label: "Oversized T-Shirts", href: "/products/men/oversized" },
          { label: "Long Sleeve Tops", href: "/products/men/long-sleeve" },
        ],
      },
      {
        label: "Products",
        href: "/men/products",
        children: [
          { label: "All Products", href: "/products/men/products" },
          { label: "Shorts", href: "/products/men/shorts" },
          { label: "Joggers", href: "/products/men/joggers" },
          { label: "Pullovers", href: "/products/men/pullovers" },
        ],
      },
      {
        label: "Accessories",
        href: "/men/accessories",
        children: [
          { label: "All Accessories", href: "/products/men/accessories" },
          { label: "Bags", href: "/products/men/bags" },
          { label: "Socks", href: "/products/men/socks" },
        ],
      },
      { label: "Last Chance", href: "/men/last-chance" },
      { label: "Explore", href: "/men/explore" },
    ],
  },
  {
    label: "Accessories",
    href: "/accessories",
    subItems: [
      {
        label: "Trending",
        href: "/accessories/trending",
        children: [
          { label: "New Product Drops", href: "/accessories/trending/new-drops" },
          { label: "Best Sellers", href: "/accessories/trending/best-sellers" },
          { label: "Seasonal Accessories", href: "/accessories/trending/seasonal" },
        ],
      },
      {
        label: "Bags",
        href: "/accessories/bags",
        children: [
          { label: "All Bags", href: "/products/accessories/bags" },
          { label: "Backpacks", href: "/products/accessories/backpacks" },
          { label: "Holdalls", href: "/products/accessories/holdalls" },
        ],
      },
      { label: "Equipment", href: "/accessories/equipment" },
      {
        label: "Socks",
        href: "/accessories/socks",
        children: [
          { label: "All Socks", href: "/products/accessories/socks" },
          { label: "Crew Socks", href: "/products/accessories/crew-socks" },
          { label: "Ankle Socks", href: "/products/accessories/ankle-socks" },
        ],
      },
      {
        label: "Headwear",
        href: "/accessories/headwear",
        children: [
          { label: "All Headwear", href: "/products/accessories/headwear" },
          { label: "Caps", href: "/products/accessories/caps" },
          { label: "Headbands", href: "/products/accessories/headbands" },
        ],
      },
      { label: "Last Chance", href: "/accessories/last-chance" },
    ],
  },
  {
    label: "Explore",
    href: "/explore",
    subItems: [
      {
        label: "Women's Guides",
        href: "/explore/womens-guides",
        children: [
          { label: "Leggings Guide", href: "/explore/womens-guides/leggings" },
          { label: "Sports Bra Guide", href: "/explore/womens-guides/sports-bras" },
          { label: "Running Guide", href: "/explore/womens-guides/running" },
        ],
      },
      {
        label: "Men's Guides",
        href: "/explore/mens-guides",
        children: [
          { label: "Shorts Guide", href: "/explore/mens-guides/shorts" },
          { label: "Running Guide", href: "/explore/mens-guides/running" },
        ],
      },
      { label: "Women's Clothing", href: "/explore/womens-clothing" },
      { label: "Men's Clothing", href: "/explore/mens-clothing" },
      { label: "Find Out More", href: "/explore/about" },
    ],
  },
];
