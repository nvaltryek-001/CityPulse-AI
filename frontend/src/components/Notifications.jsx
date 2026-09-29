import React from "react";
import {
  buildReportNotifications,
  buildAnalyticsNotification
} from "../services/notificationService.js";

function formatTime(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function iconFor(type) {
  if (type === "Resolved") return "✓";
  if (type === "In Progress") return "↻";
  if (type === "Assigned") return "→";
  if (type === "Rejected") return "!";
  if (type === "AI Analyzed") return "✦";
  if (type === "Analytics") return "◈";

  return "•";
}

export default function Notifications({
  reports = [],
  analytics,
  navigate
}) {
  const [activeFilter, setActiveFilter] =
    React.useState("All");

  const notifications =
    React.useMemo(() => {
      const reportItems =
        buildReportNotifications(reports);

      const analyticsItem =
        buildAnalyticsNotification(
          analytics
        );

      if (analyticsItem) {
        return [
          analyticsItem,
          ...reportItems
        ];
      }

      return reportItems;
    }, [reports, analytics]);

  const filtered =
    activeFilter === "All"
      ? notifications
      : notifications.filter(
          (item) =>
            item.type === activeFilter
        );

  const filters = [
    "All",
    "Resolved",
    "In Progress",
    "Assigned",
    "AI Analyzed",
    "Analytics"
  ];

  return (
    <div className="page notifications-page">

      <section className="page-heading">
        <div>
          <span className="eyebrow">
            CIVIC UPDATES
          </span>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated on your submitted civic
            reports and CityPulse activity.
          </p>
        </div>

        <button
          type="button"
          className="button primary"
          onClick={() =>
            navigate("reports")
          }
        >
          View My Reports
        </button>
      </section>

      <section className="notifications-filter-bar">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter}
            className={
              activeFilter === filter
                ? "notification-filter active"
                : "notification-filter"
            }
            onClick={() =>
              setActiveFilter(filter)
            }
          >
            {filter}
          </button>
        ))}
      </section>

      {filtered.length === 0 ? (
        <section className="notifications-empty">
          <div className="notifications-empty-icon">
            ◌
          </div>

          <h2>
            No updates yet
          </h2>

          <p>
            Submit a civic report and your latest
            activity will appear here.
          </p>

          <button
            type="button"
            className="button primary"
            onClick={() =>
              navigate("report")
            }
          >
            Report an Issue
          </button>
        </section>
      ) : (
        <section className="notifications-list">

          {filtered.map((item) => (
            <article
              key={item.id}
              className="notification-card"
            >
              <div
                className={
                  `notification-icon ${item.type
                    .toLowerCase()
                    .replaceAll(" ", "-")}`
                }
              >
                {iconFor(item.type)}
              </div>

              <div className="notification-content">

                <div className="notification-top">
                  <strong>
                    {item.title}
                  </strong>

                  <small>
                    {formatTime(
                      item.createdAt
                    )}
                  </small>
                </div>

                <p>
                  {item.message}
                </p>

                {item.reportId && (
                  <button
                    type="button"
                    className="notification-report-link"
                    onClick={() =>
                      navigate("reports")
                    }
                  >
                    {item.reportId}
                    {" "}→
                  </button>
                )}
              </div>
            </article>
          ))}

        </section>
      )}

    </div>
  );
}
