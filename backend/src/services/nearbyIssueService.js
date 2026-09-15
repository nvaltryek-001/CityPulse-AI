import CivicGeoReport from "../models/CivicGeoReport.js";

function validNumber(value) {

  const number = Number(value);

  return Number.isFinite(number);
}

export async function findNearbyIssues({
  latitude,
  longitude,
  radiusMeters = 5000,
  category,
  status,
  limit = 100
}) {

  if (
    !validNumber(latitude) ||
    !validNumber(longitude)
  ) {
    throw new Error(
      "Valid latitude and longitude are required."
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error(
      "Invalid coordinates."
    );
  }

  const safeRadius =
    Math.min(
      Math.max(
        Number(radiusMeters) || 5000,
        100
      ),
      50000
    );

  const safeLimit =
    Math.min(
      Math.max(
        Number(limit) || 100,
        1
      ),
      500
    );

  const filter = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [
            lng,
            lat
          ]
        },
        $maxDistance: safeRadius
      }
    }
  };

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  const records =
    await CivicGeoReport
      .find(filter)
      .limit(safeLimit)
      .lean();

  return records.map(
    (record) => {

      const coordinates =
        record.location?.coordinates || [];

      const distance =
        calculateDistanceMeters(
          lat,
          lng,
          coordinates[1],
          coordinates[0]
        );

      return {
        ...record,
        distanceMeters:
          Math.round(distance),
        distanceKm:
          Number(
            (distance / 1000)
              .toFixed(2)
          )
      };
    }
  );
}

function calculateDistanceMeters(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R = 6371000;

  const toRadians =
    (value) =>
      value * Math.PI / 180;

  const dLat =
    toRadians(lat2 - lat1);

  const dLon =
    toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      toRadians(lat1)
    ) *
    Math.cos(
      toRadians(lat2)
    ) *
    Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

export async function getNearbyStats({
  latitude,
  longitude,
  radiusMeters = 5000
}) {

  const records =
    await findNearbyIssues({
      latitude,
      longitude,
      radiusMeters,
      limit: 500
    });

  const stats = {
    total: records.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  };

  for (const record of records) {

    if (record.status === "open") {
      stats.open++;
    }

    if (
      record.status ===
      "in-progress"
    ) {
      stats.inProgress++;
    }

    if (
      record.status === "resolved"
    ) {
      stats.resolved++;
    }

    if (
      record.status === "rejected"
    ) {
      stats.rejected++;
    }
  }

  return stats;
}
