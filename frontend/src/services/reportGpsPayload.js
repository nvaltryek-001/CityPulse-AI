export function attachGpsToReport(
  report,
  gps
) {

  if (!report) {
    return report;
  }

  if (!gps) {
    return report;
  }

  const latitude =
    Number(gps.latitude);

  const longitude =
    Number(gps.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {

    throw new Error(
      "Invalid GPS coordinates."
    );
  }

  return {

    ...report,

    latitude,

    longitude,

    gps: {

      latitude,

      longitude,

      accuracy:
        gps.accuracy ?? null,

      capturedAt:
        gps.capturedAt ??
        new Date().toISOString()

    },

    location: {

      ...(report.location || {}),

      latitude,

      longitude

    }

  };
}
