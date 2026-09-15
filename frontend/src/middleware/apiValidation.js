const text = (value, max = 2000) => {
  if (value === undefined || value === null) return "";

  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, max);
};

const validCoordinate = (value, min, max) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
};

export const validateReportPayload = (req, res, next) => {
  const body = req.body || {};

  const description = text(
    body.description ||
    body.issueDescription ||
    body.aiSummary,
    5000
  );

  if (!description) {
    return res.status(400).json({
      success: false,
      error: "Report description is required."
    });
  }

  if (body.latitude !== undefined &&
      !validCoordinate(body.latitude, -90, 90)) {
    return res.status(400).json({
      success: false,
      error: "Invalid latitude."
    });
  }

  if (body.longitude !== undefined &&
      !validCoordinate(body.longitude, -180, 180)) {
    return res.status(400).json({
      success: false,
      error: "Invalid longitude."
    });
  }

  req.body = {
    ...body,
    description
  };

  next();
};

export const validateNearbyQuery = (req, res, next) => {
  const {
    latitude,
    longitude,
    radius,
    limit
  } = req.query;

  if (!validCoordinate(latitude, -90, 90)) {
    return res.status(400).json({
      success: false,
      error: "Invalid latitude."
    });
  }

  if (!validCoordinate(longitude, -180, 180)) {
    return res.status(400).json({
      success: false,
      error: "Invalid longitude."
    });
  }

  if (radius !== undefined) {
    const radiusNumber = Number(radius);

    if (
      !Number.isFinite(radiusNumber) ||
      radiusNumber < 100 ||
      radiusNumber > 50000
    ) {
      return res.status(400).json({
        success: false,
        error: "Radius must be between 100m and 50000m."
      });
    }
  }

  if (limit !== undefined) {
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 500
    ) {
      return res.status(400).json({
        success: false,
        error: "Limit must be between 1 and 500."
      });
    }
  }

  next();
};
