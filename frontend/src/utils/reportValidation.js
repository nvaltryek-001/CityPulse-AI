/**
 * CityPulse AI
 * Report Validation
 */

export function validateReport(report = {}) {
  const errors = {};

  if (!report.category) {
    errors.category = "Issue category is required.";
  }

  if (!report.issueType) {
    errors.issueType = "Specific issue type is required.";
  }

  if (
    !report.description ||
    !String(report.description).trim()
  ) {
    errors.description =
      "Please describe the civic issue.";
  }

  if (
    Number(report.severity) < 1 ||
    Number(report.severity) > 5
  ) {
    errors.severity =
      "Severity must be between 1 and 5.";
  }

  if (
    Number(report.safetyRisk) < 1 ||
    Number(report.safetyRisk) > 5
  ) {
    errors.safetyRisk =
      "Safety risk must be between 1 and 5.";
  }

  if (
    report.trafficImpact &&
    !["Low", "Medium", "High"].includes(
      report.trafficImpact
    )
  ) {
    errors.trafficImpact =
      "Invalid traffic impact.";
  }

  if (
    report.images &&
    report.images.length > 5
  ) {
    errors.images =
      "Maximum 5 evidence images are allowed.";
  }

  if (
    report.latitude !== null &&
    report.latitude !== undefined &&
    (
      Number(report.latitude) < -90 ||
      Number(report.latitude) > 90
    )
  ) {
    errors.latitude =
      "Invalid latitude.";
  }

  if (
    report.longitude !== null &&
    report.longitude !== undefined &&
    (
      Number(report.longitude) < -180 ||
      Number(report.longitude) > 180
    )
  ) {
    errors.longitude =
      "Invalid longitude.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function isReportReady(report) {
  return validateReport(report).valid;
}
