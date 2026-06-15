function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseSearchTerms(query: string): string[] {
  return query.trim().split(/\s+/).filter(Boolean);
}

/** Case-insensitive substring match: "ad" matches "Adapt Fleck x". */
export function buildTitleSubstringRegex(term: string): RegExp {
  return new RegExp(escapeRegex(term), "i");
}

export function buildTitleWordSearchFilter(
  query: string,
): Record<string, unknown> | null {
  const terms = parseSearchTerms(query);
  if (!terms.length) return null;

  return {
    $and: terms.map((term) => ({
      title: buildTitleSubstringRegex(term),
    })),
  };
}
