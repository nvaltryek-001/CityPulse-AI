export function normalizeMapIssue(
  issue
) {
  const latitude = Number(
    issue?.location?.latitude ??
    issue?.latitude
  );

  const longitude = Number(
    issue?.location?.longitude ??
    issue?.longitude
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    ...issue,
    location: {
      ...(issue.location || {}),
      latitude,
      longitude
    }
  };
}

export function prepareMapIssues(
  issues = []
) {
  return issues
    .map(normalizeMapIssue)
    .filter(Boolean);
}
