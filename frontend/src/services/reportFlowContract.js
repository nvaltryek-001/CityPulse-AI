export function buildCompleteReportPayload(flow = {}) {
  const report = flow.report || {};

  return {
    ...report,

    title:
      report.title ||
      flow.analysis?.title ||
      "Civic Issue Report",

    description:
      report.description ||
      flow.analysis?.description ||
      "",

    category:
      report.category ||
      flow.analysis?.category ||
      "Other",

    priority:
      report.priority ||
      flow.analysis?.priority ||
      "medium",

    department:
      report.department ||
      flow.analysis?.department ||
      "Municipal Services",

    photos:
      flow.photos ||
      report.photos ||
      [],

    aiAnalysis:
      flow.analysis ||
      report.aiAnalysis ||
      null,

    gps:
      flow.gps ||
      report.gps ||
      null,

    location:
      report.location ||
      (
        flow.gps
          ? {
              latitude: flow.gps.latitude,
              longitude: flow.gps.longitude
            }
          : null
      ),

    source:
      report.source ||
      "citypulse-web",

    clientSubmittedAt:
      new Date().toISOString()
  };
}

export function validateCompleteReportPayload(payload) {
  if (!payload) {
    return {
      valid: false,
      errors: ["Report payload is missing."]
    };
  }

  const errors = [];

  if (!payload.title) {
    errors.push("Report title is required.");
  }

  if (!payload.description) {
    errors.push("Report description is required.");
  }

  if (!payload.category) {
    errors.push("Report category is required.");
  }

  if (!payload.department) {
    errors.push("Responsible department is required.");
  }

  if (
    payload.gps &&
    (
      !Number.isFinite(Number(payload.gps.latitude)) ||
      !Number.isFinite(Number(payload.gps.longitude))
    )
  ) {
    errors.push("GPS coordinates are invalid.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
