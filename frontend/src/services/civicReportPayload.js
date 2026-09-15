export function normalizeCivicReport({
  report = {},
  ai = {},
  images = [],
  location = {}
} = {}) {

  const latitude =
    location.latitude ??
    report.latitude ??
    null;

  const longitude =
    location.longitude ??
    report.longitude ??
    null;

  return {
    category:
      ai.category ||
      report.issueType ||
      "Other",

    issueType:
      report.issueType ||
      ai.category ||
      "Other",

    description:
      report.description ||
      "",

    location: {
      address:
        location.address ||
        report.location ||
        "",

      latitude,

      longitude
    },

    severity:
      Number(
        ai.severity ||
        report.severity ||
        1
      ),

    priority:
      ai.priority ||
      report.priority ||
      "Medium",

    trafficLevel:
      report.trafficLevel ||
      "Low",

    safetyRisk:
      Number(
        report.safetyRisk || 1
      ),

    images: images.map(
      (image) => ({
        name: image.name || "evidence",
        type:
          image.type ||
          "image/jpeg",
        size:
          Number(image.size) || 0,
        dataUrl:
          image.dataUrl || ""
      })
    ),

    aiAnalysis: {
      detectedIssue:
        ai.detectedIssue || "",

      category:
        ai.category ||
        report.issueType ||
        "Other",

      severity:
        Number(
          ai.severity ||
          report.severity ||
          1
        ),

      priority:
        ai.priority ||
        report.priority ||
        "Medium",

      confidence:
        Number(
          ai.confidence || 0
        ),

      observations:
        Array.isArray(
          ai.observations
        )
          ? ai.observations
          : [],

      recommendation:
        ai.recommendation ||
        "",

      department:
        ai.department ||
        "",

      evidenceQuality:
        ai.evidenceQuality ||
        "Fair",

      possibleDuplicate:
        Boolean(
          ai.possibleDuplicate
        )
    },

    status: "Submitted",
    source: "CityPulse AI"
  };
}
