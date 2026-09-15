export function normalizeReportResult(
  response = {}
) {

  const report =
    response.report ||
    response.data ||
    response.result ||
    response;

  return {

    id:
      report._id ||
      report.id ||
      report.reportId ||
      null,

    title:
      report.title ||
      "",

    description:
      report.description ||
      "",

    category:
      report.category ||
      "Other",

    priority:
      report.priority ||
      "medium",

    status:
      report.status ||
      "open",

    department:
      report.department ||
      "Municipal Services",

    latitude:
      report.latitude ??
      report.location?.latitude ??
      report.gps?.latitude ??
      null,

    longitude:
      report.longitude ??
      report.location?.longitude ??
      report.gps?.longitude ??
      null,

    createdAt:
      report.createdAt ||
      report.clientSubmittedAt ||
      null,

    aiAnalysis:
      report.aiAnalysis ||
      null,

    recommendation:
      report.recommendation ||
      report.aiAnalysis?.recommendation ||
      ""
  };
}
