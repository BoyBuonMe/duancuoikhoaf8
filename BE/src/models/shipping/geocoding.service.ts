import axios from "axios";
import {
  PROVINCE_COORDINATES,
  SHIPPING_ORIGIN,
} from "@/models/shipping/shipping.constants";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "ECommerceShipping/1.0 (contact@example.com)";

export async function resolveDestinationCoordinates(input: {
  provinceCode?: string;
  provinceName?: string;
  wardName?: string;
  streetAddress?: string;
}): Promise<{ lat: number; lng: number; source: "geocode" | "province" }> {
  const parts = [
    input.streetAddress?.trim(),
    input.wardName?.trim(),
    input.provinceName?.trim(),
    "Vietnam",
  ].filter(Boolean);

  if (parts.length >= 2) {
    try {
      const { data } = await axios.get<
        Array<{ lat: string; lon: string; importance?: string }>
      >(NOMINATIM_URL, {
        params: {
          q: parts.join(", "),
          format: "json",
          limit: 1,
          countrycodes: "vn",
        },
        headers: { "User-Agent": USER_AGENT },
        timeout: 8000,
      });

      const hit = data[0];
      if (hit?.lat && hit?.lon) {
        return {
          lat: Number(hit.lat),
          lng: Number(hit.lon),
          source: "geocode",
        };
      }
    } catch {
      // Fall back to province centroid below.
    }
  }

  const code = input.provinceCode?.trim();
  const fallback =
    (code && PROVINCE_COORDINATES[code]) ||
    PROVINCE_COORDINATES["79"] ||
    SHIPPING_ORIGIN;

  return {
    lat: fallback.lat,
    lng: fallback.lng,
    source: "province",
  };
}
