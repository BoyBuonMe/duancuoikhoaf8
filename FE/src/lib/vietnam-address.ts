import provincesData from "@/data/vietnam/provinces.json";
import wardsData from "@/data/vietnam/wards.json";

export interface Province {
  code: string;
  name: string;
}

export interface Ward {
  code: string;
  name: string;
  provinceCode: string;
}

export const provinces = provincesData as Province[];
export const wards = wardsData as Ward[];

export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function filterByQuery<T extends { name: string }>(
  items: T[],
  query: string,
  limit = 80,
): T[] {
  const q = normalizeSearch(query);
  if (!q) return items.slice(0, limit);
  return items
    .filter((item) => normalizeSearch(item.name).includes(q))
    .slice(0, limit);
}

export function getWardsByProvince(provinceCode: string): Ward[] {
  return wards.filter((w) => w.provinceCode === provinceCode);
}
