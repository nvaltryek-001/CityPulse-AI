/**
 * CityPulse AI — Explore Service
 *
 * Shared geographic helpers for Explore / Map components.
 * Real issue data is supplied by mapDataService/reportApi.
 */

export function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const values = [lat1, lon1, lat2, lon2].map(Number);

  if (values.some((value) => !Number.isFinite(value))) {
    return Infinity;
  }

  const [aLat, aLon, bLat, bLon] = values;

  const earthRadiusKm = 6371;

  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;

  const lat1Rad = (aLat * Math.PI) / 180;
  const lat2Rad = (bLat * Math.PI) / 180;

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const a =
    sinLat * sinLat +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      sinLon *
      sinLon;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
}

export function formatDistance(distanceKm) {
  if (!Number.isFinite(distanceKm)) {
    return "Unknown distance";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function isWithinRadius(
  latitude,
  longitude,
  targetLatitude,
  targetLongitude,
  radiusKm = 5
) {
  return (
    calculateDistance(
      latitude,
      longitude,
      targetLatitude,
      targetLongitude
    ) <= radiusKm
  );
}

export default {
  calculateDistance,
  formatDistance,
  isWithinRadius
};