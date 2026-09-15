function normalize(value) {
  return String(
    value || ""
  ).trim().toLowerCase();
}

export function buildAnalytics(
  reports = []
) {

  const total =
    reports.length;

  const categories = {};
  const statuses = {};
  const priorities = {};
  const departments = {};
  const monthly = {};

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
      normalize(
        report.status
      ) || "open";

    statuses[status] =
      (statuses[status] || 0) + 1;

    const priority =
      normalize(
        report.priority
      ) || "medium";

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

    const date =
      report.createdAt ||
      report.grievanceDate ||
      report.clientSubmittedAt;

    if (date) {

      const parsed =
        new Date(date);

      if (
        !Number.isNaN(
          parsed.getTime()
        )
      ) {

        const key =
          parsed
            .toISOString()
            .slice(0, 7);

        monthly[key] =
          (monthly[key] || 0) + 1;
      }
    }
  }

  const resolutionRate =
    total > 0
      ? Math.round(
          (resolved / total) * 100
        )
      : 0;

  const topCategories =
    Object.entries(categories)
      .sort(
        (a, b) => b[1] - a[1]
      )
      .slice(0, 10);

  const topDepartments =
    Object.entries(departments)
      .sort(
        (a, b) => b[1] - a[1]
      )
      .slice(0, 10);

  return {
    total,
    resolved,
    open,
    inProgress,
    critical,
    high,
    resolutionRate,
    categories,
    statuses,
    priorities,
    departments,
    monthly,
    topCategories,
    topDepartments
  };
}
