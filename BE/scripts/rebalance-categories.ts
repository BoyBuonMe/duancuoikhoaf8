/**
 * Reassigns products to empty nav leaf categories and refreshes category productCount.
 * Run: npx tsx scripts/rebalance-categories.ts
 */
import path from "node:path";
import { promises as fs } from "node:fs";

const SEED_DIR = path.join(__dirname, "..", "data", "seed");

interface SeedCategory {
  name: string;
  slug: string;
  level: number;
  parentSlug: string | null;
  path: string;
  pathSegments: string[];
  productCount: number;
}

interface SeedProduct {
  sourceUrl: string;
  title: string;
  price: { amount: number; currency: string };
  categories?: string[];
  imageUrls?: string[];
  localImagePaths?: string[];
  scrapedAt?: string;
}

const GENDER_MAP: Record<string, string> = {
  Women: "Womens",
  Men: "Mens",
  Accessories: "Unisex",
};

const NAV_ONLY_LABELS = new Set([
  "Products",
  "Trending",
  "Last Chance",
  "Explore",
  "Equipment",
  "T-Shirts & Tops",
  "Underwear",
  "Bags",
  "Socks",
  "Headwear",
]);

const EDITORIAL_PATTERN =
  /^(All\s|New Product Drops|Best Sellers|Spring Looks|Seasonal|Pilates|Running|Lifting|For Less|Accessories For Less|New to Gymshark)/i;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function pathSegmentsToProductFilter(segments: string[]): string[] {
  if (!segments.length) return [];

  const filters: string[] = [];
  const gender = GENDER_MAP[segments[0]];
  if (gender) filters.push(gender);

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const isLeaf = i === segments.length - 1;

    if (!isLeaf && EDITORIAL_PATTERN.test(seg)) continue;
    if (/\bGuide\b/i.test(seg)) continue;
    if (/^All\s/i.test(seg)) continue;
    if (seg.endsWith("?")) continue;
    if (NAV_ONLY_LABELS.has(seg)) continue;
    filters.push(seg);
  }

  return filters;
}

function productMatchesFilters(product: SeedProduct, filters: string[]): boolean {
  if (!filters.length) return false;
  const categories = product.categories ?? [];
  return filters.every((filter) =>
    categories.some((cat) => new RegExp(`^${escapeRegex(filter)}$`, "i").test(cat)),
  );
}

function addCategoryTag(product: SeedProduct, tag: string): void {
  if (!product.categories) product.categories = [];
  const exists = product.categories.some(
    (cat) => cat.toLowerCase() === tag.toLowerCase(),
  );
  if (!exists) product.categories.push(tag);
}

/** Map scraped taxonomy slugs to nav leaf labels used by pathSegmentsToProductFilter. */
function normalizeScrapedTags(product: SeedProduct): void {
  const cats = product.categories ?? [];
  const h = haystack(product);

  if (
    isMens(product) &&
    (/(\b|^)tank\b/i.test(h) ||
      cats.some((c) => /^tanks?$/i.test(c) || /sleeveless/i.test(c)))
  ) {
    addCategoryTag(product, "Tank Tops");
  }

  if (/crew sock/i.test(h) || cats.some((c) => /^crew$/i.test(c))) {
    addCategoryTag(product, "Crew Socks");
  }

  if (/headband/i.test(h) || cats.some((c) => /^headband$/i.test(c))) {
    addCategoryTag(product, "Headbands");
  }

  if (/holdall/i.test(h) || cats.some((c) => /holdall/i.test(c))) {
    addCategoryTag(product, "Holdalls");
  }

  if (/backpack/i.test(h) || cats.some((c) => /^backpack$/i.test(c))) {
    addCategoryTag(product, "Backpacks");
  }

  if (
    /sock/i.test(h) &&
    !/crew/i.test(h) &&
    (/ankle|quarter|trainer|no show|tab/i.test(h) ||
      cats.some((c) => /^ankle/i.test(c)))
  ) {
    addCategoryTag(product, "Ankle Socks");
  }

  if (
    isMens(product) &&
    (/sock|cap|bag|headband|backpack|holdall/i.test(h) ||
      cats.some((c) => /^(Accessories|Socks|Headwear|Bags)$/i.test(c)))
  ) {
    addCategoryTag(product, "Accessories");
  }

  if (
    isUnisex(product) &&
    (/seasonal|summer|winter|holiday|gift|pastel|sorbet|chilled blue|focus pink/i.test(
      h,
    ) ||
      cats.some((c) => /^Seasonal/i.test(c)))
  ) {
    addCategoryTag(product, "Seasonal Accessories");
  }

  if (cats.some((c) => /^accessories$/i.test(c))) {
    addCategoryTag(product, "Unisex");
  }
}

const INVALID_NAV_TAGS = new Set(["Lifting Straps", "Lifting Belts"]);

function stripInvalidNavTags(product: SeedProduct): void {
  if (!product.categories?.length) return;
  product.categories = product.categories.filter((cat) => {
    if (!INVALID_NAV_TAGS.has(cat)) return true;
    const h = haystack(product);
    if (cat === "Lifting Straps") {
      return /lifting strap|wrist wrap|dip belt strap/i.test(h);
    }
    if (cat === "Lifting Belts") {
      return /lifting belt|lever belt|dip belt/i.test(h) && !/strap/i.test(h);
    }
    return true;
  });
}

function haystack(product: SeedProduct): string {
  return `${product.title} ${product.sourceUrl} ${(product.categories ?? []).join(" ")}`.toLowerCase();
}

function isWomens(product: SeedProduct): boolean {
  return (product.categories ?? []).some((c) => /^womens$/i.test(c));
}

function isMens(product: SeedProduct): boolean {
  return (product.categories ?? []).some((c) => /^mens$/i.test(c));
}

function isUnisex(product: SeedProduct): boolean {
  return (product.categories ?? []).some((c) => /^unisex$/i.test(c));
}

interface ReassignRule {
  categorySlug: string;
  pick: (product: SeedProduct) => boolean;
  limit: number;
}

const REASSIGN_RULES: ReassignRule[] = [
  {
    categorySlug: "women-leggings-seamless",
    pick: (p) =>
      /seamless/i.test(haystack(p)) &&
      (p.categories ?? []).some((c) => /^leggings$/i.test(c)),
    limit: 18,
  },
  {
    categorySlug: "women-leggings-high-waisted",
    pick: (p) =>
      (/high[\s-]?waist|mid[\s-]?high rise|mid-high rise/i.test(haystack(p)) ||
        /full_length|tight/i.test(haystack(p))) &&
      (p.categories ?? []).some((c) => /^leggings$/i.test(c)),
    limit: 20,
  },
  {
    categorySlug: "women-leggings-with-pockets",
    pick: (p) =>
      isWomens(p) &&
      (p.categories ?? []).some((c) => /^leggings$/i.test(c)) &&
      /everyday|training|adapt|flex|lift|whitney|legacy/i.test(haystack(p)),
    limit: 10,
  },
  {
    categorySlug: "women-leggings-tall",
    pick: (p) =>
      (/tall|full_length|wide_leg/i.test(haystack(p)) ||
        /legacy leggings|whitney/i.test(haystack(p))) &&
      (p.categories ?? []).some((c) => /^leggings$/i.test(c)),
    limit: 15,
  },
  {
    categorySlug: "women-trending-new-drops",
    pick: (p) =>
      /ss26|aw25|ss25|new/i.test(haystack(p)) &&
      (p.categories ?? []).some((c) => /^womens$/i.test(c)),
    limit: 15,
  },
  {
    categorySlug: "women-trending-best-sellers",
    pick: (p) =>
      /legacy|vital|adapt|everyday|whitney|flex/i.test(haystack(p)) &&
      (p.categories ?? []).some((c) => /^womens$/i.test(c)),
    limit: 15,
  },
  {
    categorySlug: "women-trending-form-now-live",
    pick: (p) => isWomens(p) && /form|sculpt|lift|contour/i.test(haystack(p)),
    limit: 10,
  },
  {
    categorySlug: "women-trending-spring-looks",
    pick: (p) =>
      isWomens(p) &&
      /spring|pastel|soft white|light grey|haze green|force blue|cherry purple|petrol blue/i.test(
        haystack(p),
      ),
    limit: 12,
  },
  {
    categorySlug: "women-trending-everyday-seamless",
    pick: (p) =>
      isWomens(p) &&
      /everyday seamless|vital seamless|adapt seamless|flex seamless/i.test(
        haystack(p),
      ),
    limit: 12,
  },
  {
    categorySlug: "women-trending-pilates",
    pick: (p) =>
      isWomens(p) &&
      /pilates|studio|soft.*legging|everyday.*legging/i.test(haystack(p)),
    limit: 10,
  },
  {
    categorySlug: "men-trending-new-drops",
    pick: (p) =>
      /ss26|aw25|ss25|new|cbum|bratz/i.test(haystack(p)) &&
      (p.categories ?? []).some((c) => /^mens$/i.test(c)),
    limit: 12,
  },
  {
    categorySlug: "men-trending-best-sellers",
    pick: (p) =>
      /crest|power|vital|arrival|legacy|essential/i.test(haystack(p)) &&
      (p.categories ?? []).some((c) => /^mens$/i.test(c)),
    limit: 12,
  },
  {
    categorySlug: "men-tshirts-tops-oversized",
    pick: (p) => /oversized|oversize/i.test(haystack(p)),
    limit: 15,
  },
  {
    categorySlug: "men-tshirts-tops-long-sleeve",
    pick: (p) =>
      (/long sleeve|long-sleeve|ls top|full.?zip|hoodie|pullover|baselayer/i.test(
        haystack(p),
      ) ||
        (p.categories ?? []).some((c) =>
          /^(LS Tops|long_sleeve|Pullovers)$/i.test(c),
        )),
    limit: 20,
  },
  {
    categorySlug: "men-trending-running",
    pick: (p) =>
      /running|run|velocity|arrival/i.test(haystack(p)) &&
      (p.categories ?? []).some((c) => /^mens$/i.test(c)),
    limit: 12,
  },
  {
    categorySlug: "accessories-trending-new-drops",
    pick: (p) =>
      /ss26|aw25|new/i.test(haystack(p)) &&
      (p.categories ?? []).some((c) => /^unisex$/i.test(c)),
    limit: 5,
  },
  {
    categorySlug: "accessories-trending-best-sellers",
    pick: (p) =>
      /crew sock|headband|holdall|backpack|bottle/i.test(haystack(p)),
    limit: 6,
  },
  {
    categorySlug: "accessories-trending-seasonal",
    pick: (p) => /seasonal|summer|winter|gift|holiday/i.test(haystack(p)),
    limit: 4,
  },
  {
    categorySlug: "accessories-socks-ankle",
    pick: (p) =>
      /sock/i.test(haystack(p)) &&
      !/crew/i.test(haystack(p)) &&
      (/ankle|quarter|trainer|no show|tab/i.test(haystack(p)) ||
        (p.categories ?? []).some((c) => /^ankle/i.test(c))),
    limit: 6,
  },
  {
    categorySlug: "accessories-socks-crew",
    pick: (p) =>
      /crew sock/i.test(haystack(p)) ||
      (p.categories ?? []).some((c) => /^crew$/i.test(c)),
    limit: 10,
  },
  {
    categorySlug: "men-tshirts-tops-tanks",
    pick: (p) =>
      isMens(p) &&
      (/(\b|^)tank\b/i.test(haystack(p)) ||
        (p.categories ?? []).some(
          (c) => /^tanks?$/i.test(c) || /sleeveless/i.test(c),
        )),
    limit: 20,
  },
  {
    categorySlug: "accessories-bags-backpacks",
    pick: (p) => /backpack/i.test(haystack(p)),
    limit: 6,
  },
  {
    categorySlug: "accessories-bags-holdalls",
    pick: (p) => /holdall/i.test(haystack(p)),
    limit: 8,
  },
  {
    categorySlug: "accessories-headwear-headbands",
    pick: (p) => /headband/i.test(haystack(p)),
    limit: 8,
  },
  {
    categorySlug: "accessories-equipment-lifting-straps",
    pick: (p) =>
      /lifting strap|wrist wrap|dip belt strap/i.test(haystack(p)) &&
      !(p.categories ?? []).some((c) => /sports bra|leggings|shorts/i.test(c)),
    limit: 4,
  },
  {
    categorySlug: "accessories-equipment-lifting-belts",
    pick: (p) => /belt|lever belt|lifting belt|dip belt/i.test(haystack(p)),
    limit: 4,
  },
  {
    categorySlug: "accessories-headwear-caps",
    pick: (p) => /\bcap\b|baseball cap/i.test(haystack(p)),
    limit: 5,
  },
  {
    categorySlug: "accessories-underwear-mens",
    pick: (p) =>
      ((p.categories ?? []).some((c) => /underwear/i.test(c)) &&
        (p.categories ?? []).some((c) => /^mens$/i.test(c))) ||
      /boxer|brief|trunk/i.test(haystack(p)),
    limit: 8,
  },
  {
    categorySlug: "women-accessories-all-socks",
    pick: (p) => isWomens(p) && /sock/i.test(haystack(p)),
    limit: 6,
  },
  {
    categorySlug: "men-accessories-all-socks",
    pick: (p) => isMens(p) && /sock/i.test(haystack(p)),
    limit: 6,
  },
  {
    categorySlug: "women-last-chance-for-less",
    pick: (p) =>
      isWomens(p) &&
      (p.price.amount <= 22 ||
        /aw25|ss22|ss23|gsaw21|navy-gsaw21/i.test(p.sourceUrl)),
    limit: 12,
  },
  {
    categorySlug: "men-last-chance-for-less",
    pick: (p) =>
      isMens(p) &&
      (p.price.amount <= 22 ||
        /aw25|ss22|ss23|gsaw21|navy-gsaw21/i.test(p.sourceUrl)),
    limit: 10,
  },
  {
    categorySlug: "accessories-last-chance-for-less",
    pick: (p) =>
      isUnisex(p) &&
      (p.price.amount <= 20 || /aw25|ss22|ss23/i.test(p.sourceUrl)),
    limit: 6,
  },
  {
    categorySlug: "women-explore-new-to-gymshark",
    pick: (p) =>
      isWomens(p) &&
      /ss26|new product drops|new to gymshark/i.test(haystack(p)),
    limit: 10,
  },
];

async function readNdjson<T>(filePath: string): Promise<T[]> {
  const raw = await fs.readFile(filePath, "utf-8");
  return raw
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as T);
}

async function writeNdjson(filePath: string, rows: unknown[]) {
  const content = rows.map((row) => JSON.stringify(row)).join("\n") + "\n";
  await fs.writeFile(filePath, content, "utf-8");
}

async function main() {
  const productsPath = path.join(SEED_DIR, "products.ndjson");
  const categoriesPath = path.join(SEED_DIR, "categories.ndjson");

  const products = await readNdjson<SeedProduct>(productsPath);
  const categories = await readNdjson<SeedCategory>(categoriesPath);

  for (const product of products) {
    stripInvalidNavTags(product);
    normalizeScrapedTags(product);
  }

  for (const rule of REASSIGN_RULES) {
    const category = categories.find((c) => c.slug === rule.categorySlug);
    if (!category) {
      console.warn(`! Category not found: ${rule.categorySlug}`);
      continue;
    }

    const filters = pathSegmentsToProductFilter(category.pathSegments);
    const leafTag = category.pathSegments[category.pathSegments.length - 1];
    const already = products.filter((p) => productMatchesFilters(p, filters)).length;
    if (already >= rule.limit) {
      console.log(`= ${rule.categorySlug}: already has ${already} products`);
      continue;
    }

    let added = 0;
    for (const product of products) {
      if (productMatchesFilters(product, filters)) continue;
      if (!rule.pick(product)) continue;

      addCategoryTag(product, leafTag);
      added++;
      if (already + added >= rule.limit) break;
    }

    console.log(`+ ${rule.categorySlug}: tagged ${added} products as "${leafTag}"`);
  }

  for (const category of categories) {
    const filters = pathSegmentsToProductFilter(category.pathSegments);
    category.productCount = products.filter((p) =>
      productMatchesFilters(p, filters),
    ).length;
  }

  await writeNdjson(productsPath, products);
  await writeNdjson(categoriesPath, categories);

  const emptyLeaves = categories.filter(
    (c) => c.level === 2 && c.productCount === 0,
  );
  console.log(`\nUpdated ${products.length} products and ${categories.length} categories.`);
  console.log(`Empty level-2 categories remaining: ${emptyLeaves.length}`);
  if (emptyLeaves.length) {
    emptyLeaves.slice(0, 15).forEach((c) => console.log(`  - ${c.slug}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
