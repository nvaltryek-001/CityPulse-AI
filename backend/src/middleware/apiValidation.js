const numberInRange = (value, min, max) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
};

export function validateReportPayload(req, res, next) {
  const body = req.body || {};

  const description = String(
    body.description ||
    body.issueDescription ||
    body.aiSummary ||
    ""
  ).trim();

  if (!description) {
    return res.status(400).json({
      success: false,
      error: "Report description is required."
    });
  }

  if (
    body.latitude !== undefined &&
    !numberInRange(body.latitude, -90, 90)
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid latitude."
    });
  }

  if (
    body.longitude !== undefined &&
    !numberInRange(body.longitude, -180, 180)
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid longitude."
    });
  }

  req.body.description = description.slice(0, 5000);

  next();
}

export function validateNearbyQuery(req, res, next) {
  const { latitude, longitude, radius, limit } = req.query;

  if (!numberInRange(latitude, -90, 90)) {
    return res.status(400).json({
      success: false,
      error: "Invalid latitude."
    });
  }

  if (!numberInRange(longitude, -180, 180)) {
    return res.status(400).json({
      success: false,
      error: "Invalid longitude."
    });
  }

  if (radius !== undefined) {
    const r = Number(radius);

    if (!Number.isFinite(r) || r < 100 || r > 50000) {
      return res.status(400).json({
        success: false,
        error: "Radius must be between 100 and 50000 meters."
      });
    }
  }

  if (limit !== undefined) {
    const l = Number(limit);

    if (!Number.isInteger(l) || l < 1 || l > 500) {
      return res.status(400).json({
        success: false,
        error: "Limit must be between 1 and 500."
      });
    }
  }

  next();
}
