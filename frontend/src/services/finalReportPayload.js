export function buildFinalReportPayload(pipeline = {}) {

  const report =
    pipeline.report || {};

  const analysis =
    pipeline.analysis || {};

  const gps =
    pipeline.gps || report.gps || null;

  return {

    title:
      report.title ||
      analysis.title ||
      "Civic Issue Report",

    description:
      report.description ||
      analysis.description ||
      "",

    category:
      report.category ||
      analysis.category ||
      "Other",

    subCategory:
      report.subCategory ||
      analysis.subCategory ||
      null,

    priority:
      report.priority ||
      analysis.priority ||
      "medium",

    department:
      report.department ||
      analysis.department ||
      "Municipal Services",

    aiAnalysis:
      analysis || null,

    photos:
      pipeline.photos ||
      report.photos ||
      [],

    gps,

    location:
      gps
        ? {
            latitude:
              Number(gps.latitude),
            longitude:
              Number(gps.longitude)
          }
        : report.location || null,

    source:
      report.source ||
      "citypulse-web",

    submittedFrom:
      "web",

    clientSubmittedAt:
      new Date().toISOString()
  };
}
