export function calculateExploreStats(
  issues = []
) {

  const stats = {
    total: issues.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    categories: {}
  };

  for (const issue of issues) {

    const status =
      String(
        issue.status || ""
      ).toLowerCase();

    const priority =
      String(
        issue.priority || ""
      ).toLowerCase();

    if (status === "open") {
      stats.open++;
    }

    if (
      status === "in-progress" ||
      status === "in progress"
    ) {
      stats.inProgress++;
    }

    if (
      status === "resolved" ||
      status === "closed"
    ) {
      stats.resolved++;
    }

    if (priority === "critical") {
      stats.critical++;
    }

    if (priority === "high") {
      stats.high++;
    }

    const category =
      issue.category ||
      "Other";

    stats.categories[category] =
      (stats.categories[category] || 0) + 1;
  }

  return stats;
}
