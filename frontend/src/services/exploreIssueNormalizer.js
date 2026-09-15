function numberOrNull(value) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

export function normalizeExploreIssue(
  issue = {}
) {

  const latitude =
    numberOrNull(
      issue.latitude ??
      issue.location?.latitude ??
      issue.gps?.latitude ??
      issue.geometry?.coordinates?.[1]
    );

  const longitude =
    numberOrNull(
      issue.longitude ??
      issue.location?.longitude ??
      issue.gps?.longitude ??
      issue.geometry?.coordinates?.[0]
    );

  return {

    id:
      issue._id ||
      issue.id ||
      issue.reportId ||
      crypto.randomUUID(),

    title:
      issue.title ||
      "Civic Issue",

    description:
      issue.description ||
      "",

    category:
      issue.category ||
      "Other",

    subCategory:
      issue.subCategory ||
      null,

    priority:
      issue.priority ||
      "medium",

    severity:
      issue.severity ||
      "medium",

    status:
      issue.status ||
      "open",

    department:
      issue.department ||
      "Municipal Services",

    latitude,
    longitude,

    distance:
      numberOrNull(
        issue.distance ??
        issue.distanceMeters
      ),

    createdAt:
      issue.createdAt ||
      issue.clientSubmittedAt ||
      null,

    recommendation:
      issue.recommendation ||
      issue.aiAnalysis?.recommendation ||
      "",

    aiAnalysis:
      issue.aiAnalysis ||
      null
  };
}

export function normalizeExploreIssues(
  issues = []
) {

  return Array.isArray(issues)
    ? issues
        .map(normalizeExploreIssue)
        .filter(
          issue =>
            issue.latitude !== null &&
            issue.longitude !== null
        )
    : [];
}
