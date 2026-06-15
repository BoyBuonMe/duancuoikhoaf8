/** Extract the URL slug from a Gymshark product sourceUrl (path after `/products/`). */
export function productSlugFromSourceUrl(sourceUrl: string): string {
  try {
    const pathname = new URL(sourceUrl).pathname;
    const marker = "/products/";
    const idx = pathname.indexOf(marker);
    if (idx >= 0) return pathname.slice(idx + marker.length);
  } catch {
    const marker = "/products/";
    const idx = sourceUrl.indexOf(marker);
    if (idx >= 0) return sourceUrl.slice(idx + marker.length);
  }
  return sourceUrl;
}
