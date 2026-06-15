import {
  DISTANCE_THRESHOLDS_KM,
  SHIPPING_FEES,
  SHIPPING_ORIGIN,
} from "@/models/shipping/shipping.constants";

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

export function distanceFromOriginKm(lat: number, lng: number): number {
  return haversineDistanceKm(
    SHIPPING_ORIGIN.lat,
    SHIPPING_ORIGIN.lng,
    lat,
    lng,
  );
}

export function standardShippingFeeFromDistanceKm(distanceKm: number): number {
  if (distanceKm <= DISTANCE_THRESHOLDS_KM.tier1Max) {
    return SHIPPING_FEES.standardWithin50Km;
  }
  if (distanceKm <= DISTANCE_THRESHOLDS_KM.tier2Max) {
    return SHIPPING_FEES.standard50To300Km;
  }
  return SHIPPING_FEES.standardOver300Km;
}
