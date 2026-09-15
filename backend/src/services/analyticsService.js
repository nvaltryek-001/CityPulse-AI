import Report from "../models/Report.js";

export async function getAnalytics(
  filters = {}
) {

  const query = {};

  if (filters.category) {
    query.category =
      filters.category;
  }

  if (filters.from || filters.to) {

    query.createdAt = {};

    if (filters.from) {
      query.createdAt.$gte =
        new Date(filters.from);
    }

    if (filters.to) {
      query.createdAt.$lte =
        new Date(filters.to);
    }
  }

  const reports =
    await Report.find(query)
      .sort({
        createdAt: -1
      })
      .lean();

  const categories = {};
  const statuses = {};
  const priorities = {};
  const departments = {};

  let resolved = 0;
  let open = 0;
  let inProgress = 0;
  let critical = 0;
  let high = 0;

  for (const report of reports) {

    const category =
      report.category ||
      "Other";

    categories[category] =
      (categories[category] || 0) + 1;

    const status =
      String(
        report.status ||
        "open"
      ).toLowerCase();

    statuses[status] =
      (statuses[status] || 0) + 1;

    const priority =
      String(
        report.priority ||
        "medium"
      ).toLowerCase();

    priorities[priority] =
      (priorities[priority] || 0) + 1;

    const department =
      report.department ||
      "Municipal Services";

    departments[department] =
      (departments[department] || 0) + 1;

    if (
      status === "resolved" ||
      status === "closed"
    ) {
      resolved++;
    }

    if (status === "open") {
      open++;
    }

    if (
      status === "in-progress" ||
      status === "in progress"
    ) {
      inProgress++;
    }

    if (priority === "critical") {
      critical++;
    }

    if (priority === "high") {
      high++;
    }
  }

  const total =
    reports.length;

  const resolutionRate =
    total > 0
      ? Math.round(
          (resolved / total) * 100
        )
      : 0;

  return {
    success: true,

    summary: {
      total,
      resolved,
      open,
      inProgress,
      critical,
      high,
      resolutionRate
    },

    categories,
    statuses,
    priorities,
    departments,

    generatedAt:
      new Date().toISOString()
  };
}
