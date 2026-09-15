export const MAP_CONFIG = {
  defaultCenter: [
    12.9716,
    77.5946
  ],
  defaultZoom: 13,
  nearbyRadiusKm: 5
};

export function getMapCenter(
  location
) {
  if (
    location &&
    Number.isFinite(
      Number(location.latitude)
    ) &&
    Number.isFinite(
      Number(location.longitude)
    )
  ) {
    return [
      Number(location.latitude),
      Number(location.longitude)
    ];
  }

  return MAP_CONFIG.defaultCenter;
}

export function getOpenStreetMapUrl(
  latitude,
  longitude,
  zoom = 18
) {
  return (
    `https://www.openstreetmap.org/` +
    `?mlat=${encodeURIComponent(latitude)}` +
    `&mlon=${encodeURIComponent(longitude)}` +
    `#map=${zoom}/${latitude}/${longitude}`
  );
}

export function getNavigationUrl(
  latitude,
  longitude
) {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${encodeURIComponent(
      `${latitude},${longitude}`
    )}`
  );
}

export function getOSMNavigationUrl(
  latitude,
  longitude
) {
  return getOpenStreetMapUrl(
    latitude,
    longitude,
    18
  );
}

export function isValidCoordinates(
  latitude,
  longitude
) {
  return (
    Number.isFinite(
      Number(latitude)
    ) &&
    Number.isFinite(
      Number(longitude)
    ) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180
  );
}
