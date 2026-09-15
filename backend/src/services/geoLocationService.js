export function toGeoPoint(latitude, longitude) {

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null;
  }

  if (
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return {
    type: "Point",
    coordinates: [
      lng,
      lat
    ]
  };
}

export function normalizeCoordinates(latitude, longitude) {

  const geo = toGeoPoint(
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

export function isValidCoordinates(latitude, longitude) {

  return Boolean(
    toGeoPoint(
      latitude,
      longitude
    )
  );
}
