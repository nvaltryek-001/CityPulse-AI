/**
 * ============================================================
 * CITYPULSE AI
 * LOCATION SERVICE
 * ============================================================
 *
 * Uses the browser Geolocation API.
 *
 * No precise location is collected automatically.
 * The user explicitly clicks "Use my current location".
 *
 * Future backend integration:
 * - Reverse geocoding
 * - Address normalization
 * - PostGIS / MongoDB geospatial queries
 * - Real map provider
 */

const LOCATION_KEY =
  "citypulse_report_location";

export const DEFAULT_LOCATION = {
  address: "",
  latitude: null,
  longitude: null,
  accuracy: null,
  source: "",
  capturedAt: null
};

/**
 * Read saved location.
 */
export function getSavedLocation() {
  try {
    const raw =
      localStorage.getItem(
        LOCATION_KEY
      );

    if (!raw) {
      return {
        ...DEFAULT_LOCATION
      };
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...DEFAULT_LOCATION,
      ...(parsed || {})
    };
  } catch {
    return {
      ...DEFAULT_LOCATION
    };
  }
}

/**
 * Save location.
 */
export function saveLocation(
  location
) {
  const value = {
    ...DEFAULT_LOCATION,
    ...(location || {}),
    capturedAt:
      location?.capturedAt ||
      new Date().toISOString()
  };

  try {
    localStorage.setItem(
      LOCATION_KEY,
      JSON.stringify(value)
    );
  } catch {
    // Intentionally ignored.
  }

  return value;
}

/**
 * Clear location.
 */
export function clearLocation() {
  try {
    localStorage.removeItem(
      LOCATION_KEY
    );
  } catch {
    // Intentionally ignored.
  }
}

/**
 * Check browser GPS support.
 */
export function isGeolocationSupported() {
  return (
    typeof navigator !== "undefined" &&
    "geolocation" in navigator
  );
}

/**
 * Get current browser coordinates.
 */
export function getCurrentPosition(
  options = {}
) {
  return new Promise(
    (resolve, reject) => {
      if (
        !isGeolocationSupported()
      ) {
        reject(
          new Error(
            "Geolocation is not supported by this browser."
          )
        );

        return;
      }

      const finalOptions = {
        enableHighAccuracy:
          true,

        timeout:
          15000,

        maximumAge:
          0,

        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,

            altitude:
              position.coords.altitude,

            heading:
              position.coords.heading,

            speed:
              position.coords.speed,

            capturedAt:
              new Date().toISOString()
          });
        },

        (error) => {
// eslint-disable-next-line no-useless-assignment
          let message =
            "Unable to get your location.";

          switch (
            error?.code
          ) {
            case 1:
              message =
                "Location permission was denied. Please allow location access in your browser.";
              break;

            case 2:
              message =
                "Your current location could not be determined. Try again.";
              break;

            case 3:
              message =
                "Location request timed out. Please try again.";
              break;

            default:
              message =
                "Unable to determine your location.";
          }

          const locationError =
            new Error(message);

          locationError.code =
            error?.code;

          reject(
            locationError
          );
        },

        finalOptions
      );
    }
  );
}

/**
 * Format coordinates for display.
 */
export function formatCoordinates(
  latitude,
  longitude
) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return "Coordinates unavailable";
  }

  return `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
}

/**
 * Format accuracy.
 */
export function formatAccuracy(
  accuracy
) {
  if (
    accuracy === null ||
    accuracy === undefined ||
    Number.isNaN(
      Number(accuracy)
    )
  ) {
    return "Accuracy unavailable";
  }

  if (
    Number(accuracy) < 1000
  ) {
    return `±${Math.round(
      Number(accuracy)
    )} m`;
  }

  return `±${(
    Number(accuracy) / 1000
  ).toFixed(1)} km`;
}

/**
 * Google Maps URL.
 */
export function getGoogleMapsUrl(
  latitude,
  longitude
) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return "";
  }

  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      `${latitude},${longitude}`
    )
  );
}

/**
 * OpenStreetMap URL.
 */
export function getOpenStreetMapUrl(
  latitude,
  longitude
) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return "";
  }

  return (
    "https://www.openstreetmap.org/?mlat=" +
    encodeURIComponent(latitude) +
    "&mlon=" +
    encodeURIComponent(longitude) +
    "#map=18/" +
    encodeURIComponent(latitude) +
    "/" +
    encodeURIComponent(longitude)
  );
}

/**
 * Human-readable GPS source.
 */
export function getLocationSourceLabel(
  source
) {
  switch (source) {
    case "gps":
      return "GPS location";

    case "manual":
      return "Manually entered";

    default:
      return "Location not set";
  }
}

/**
 * Validate coordinates.
 */
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

/**
 * Reverse geocoding hook.
 *
 * Intentionally does not call an external provider
 * from the browser yet.
 *
 * Backend Script 10 will handle this securely.
 */
export async function reverseGeocode() {
  return "";
}

/**
 * Build a complete location object.
 */
export function buildLocation(
  coordinates,
  address = "",
  source = "gps"
) {
  return {
    address:
      address || "",

    latitude:
      coordinates?.latitude ??
      null,

    longitude:
      coordinates?.longitude ??
      null,

    accuracy:
      coordinates?.accuracy ??
      null,

    source,

    capturedAt:
      coordinates?.capturedAt ||
      new Date().toISOString()
  };
}
