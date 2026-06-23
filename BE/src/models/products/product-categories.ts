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

export function pathSegmentsToProductTags(segments: string[]): string[] {
  if (!segments.length) return [];

  const tags: string[] = [];
  const gender = GENDER_MAP[segments[0]];
  if (gender) tags.push(gender);

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const isLeaf = i === segments.length - 1;

    if (!isLeaf && EDITORIAL_PATTERN.test(segment)) continue;
    if (/\bGuide\b/i.test(segment)) continue;
    if (/^All\s/i.test(segment)) continue;
    if (segment.endsWith("?")) continue;
    if (NAV_ONLY_LABELS.has(segment)) continue;
    tags.push(segment);
  }

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}
