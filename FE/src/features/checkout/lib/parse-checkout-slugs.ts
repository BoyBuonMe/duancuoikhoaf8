/** Parse `slug` query param that may contain one or many slugs joined by `&`. */
export function parseCheckoutSlugs(slugParam?: string): string[] {
  if (!slugParam?.trim()) return [];

  return decodeURIComponent(slugParam)
    .split("&")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

/** Join checkout slugs for the `slug` query param. */
export function buildCheckoutSlugParam(slugs: string[]): string {
  return slugs.join("&");
}
