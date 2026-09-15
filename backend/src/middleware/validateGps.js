export function validateGpsPayload(
  req,
  res,
  next
) {

  const body =
    req.body || {};

  const latitude =
    body.location?.latitude ??
    body.latitude ??
    body.gps?.latitude;

  const longitude =
    body.location?.longitude ??
    body.longitude ??
    body.gps?.longitude;

  /*
   * GPS is optional at API level because
   * reports can still exist without map
   * coordinates.
   *
   * If coordinates are supplied, they MUST
   * be valid.
   */

  if (
    latitude === undefined &&
    longitude === undefined
  ) {
    return next();
  }

  const lat =
    Number(latitude);

  const lng =
    Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {

    return res.status(400).json({

      success: false,

      message:
        "Invalid GPS coordinates."

    });
  }

  req.reportGps = {
    latitude: lat,
    longitude: lng
  };

  next();
}
