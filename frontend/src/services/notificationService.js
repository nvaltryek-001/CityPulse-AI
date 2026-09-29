export function buildReportNotifications(
  reports = []
) {
  const sorted = [...reports]
    .sort((a, b) => {
      const first =
        new Date(a?.updatedAt || a?.createdAt || 0).getTime();

      const second =
        new Date(b?.updatedAt || b?.createdAt || 0).getTime();

      return second - first;
    });

  return sorted
    .slice(0, 8)
    .map((report, index) => {
      const issue =
        report.issueType ||
        report.aiAnalysis?.detectedIssue ||
        "Civic issue";

      const status =
        report.status ||
        "Submitted";

      const reportId =
        report.reportId ||
        `Report ${index + 1}`;

      let title = "Report update";
      let message =
        `Your report ${reportId} is currently ${status}.`;

      if (status === "Resolved") {
        title = "Issue resolved";
        message =
          `${issue} reported as ${reportId} has been marked resolved.`;
      }

      if (status === "In Progress") {
        title = "Work in progress";
        message =
          `${issue} reported as ${reportId} is currently being worked on.`;
      }

      if (status === "Assigned") {
        title = "Report assigned";
        message =
          `${issue} reported as ${reportId} has been assigned for action.`;
      }

      if (status === "AI Analyzed") {
        title = "AI analysis completed";
        message =
          `${issue} reported as ${reportId} has completed AI analysis.`;
      }

      if (status === "Rejected") {
        title = "Report update";
        message =
          `${issue} reported as ${reportId} was marked rejected.`;
      }

      return {
        id:
          report._id ||
          reportId ||
          `notification-${index}`,
        type: status,
        title,
        message,
        reportId,
        issue,
        status,
        createdAt:
          report.updatedAt ||
          report.createdAt ||
          new Date().toISOString()
      };
    });
}

export function buildAnalyticsNotification(
  analytics
) {
  if (!analytics?.summary) {
    return null;
  }

  const total =
    Number(analytics.summary.total || 0);

  const resolved =
    Number(analytics.summary.resolved || 0);

  const open =
    Number(analytics.summary.open || 0);

  return {
    id: "analytics-summary",
    type: "Analytics",
    title: "Civic activity update",
    message:
      `${total} total reports, ${resolved} resolved and ${open} currently open.`,
    reportId: "",
    issue: "CityPulse activity",
    status: "Analytics",
    createdAt:
      analytics.generatedAt ||
      new Date().toISOString()
  };
}
