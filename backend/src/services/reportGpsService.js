import { toGeoPoint } from "./geoLocationService.js";

export function extractReportCoordinates(report) {

  if (!report) {
    return null;
  }

  const latitude =
    report.location?.latitude ??
    report.latitude ??
    report.gps?.latitude;

  const longitude =
    report.location?.longitude ??
    report.longitude ??
    report.gps?.longitude;

  const geo =
    toGeoPoint(
      latitude,
      longitude
    );

  if (!geo) {
    return null;
  }

  return {
    latitude: geo.coordinates[1],
    longitude: geo.coordinates[0],
    geo
  };
}

export function hasRealGps(report) {

  return Boolean(
    extractReportCoordinates(report)
  );
}
