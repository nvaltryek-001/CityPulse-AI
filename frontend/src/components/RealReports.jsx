import React from "react";
import { cityPulseApi } from "../services/cityPulseApi.js";
import ShareActions from "./ShareActions.jsx";
import StatusControl from "./StatusControl.jsx";
import ReportPdfActions from "./ReportPdfActions.jsx";

const filters = [
  "All",
  "Submitted",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected"
];

function formatDate(value) {

  if (!value) {
    return "Recently";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

export default function RealReports({
  initialReports = [],
  navigate
}) {

  const [reports, setReports] =
    React.useState(
      initialReports
    );

  const [filter, setFilter] =
    React.useState("All");

  const [selected, setSelected] =
    React.useState(null);

  const [
    selectedReportId,
    setSelectedReportId
  ] = React.useState("");

  const [loading, setLoading] =
    React.useState(false);

  const [error, setError] =
    React.useState("");

  const load =
    React.useCallback(
      async () => {

        setLoading(true);
        setError("");

        try {

          const response =
            await cityPulseApi.reports();

          setReports(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );

        } catch (requestError) {

          setError(
            requestError?.message ||
            "Unable to load reports."
          );

        } finally {

          setLoading(false);
        }

      },
      []
    );

  React.useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered =
    filter === "All"
      ? reports
      : reports.filter(
          (report) =>
            String(
              report?.status ||
              "Submitted"
            ) === filter
        );

  const stats = {

    total:
      reports.length,

    active:
      reports.filter(
        (report) =>
          ![
            "Resolved",
            "Rejected"
          ].includes(
            report?.status
          )
      ).length,

    resolved:
      reports.filter(
        (report) =>
          report?.status ===
          "Resolved"
      ).length,

    rejected:
      reports.filter(
        (report) =>
          report?.status ===
          "Rejected"
      ).length
  };

  const startReReport =
    (report) => {

      localStorage.setItem(
        "citypulse_report_prefill",
        JSON.stringify({

          category:
            report?.category ||
            "Other",

          issueType:
            report?.issueType ||
            "Civic Issue",

          description:
            report?.description ||
            "",

          address:
            report?.location?.address ||
            "",

          severity:
            report?.severity ||
            3,

          trafficLevel:
            report?.trafficLevel ||
            "Medium",

          safetyRisk:
            report?.safetyRisk ||
            3

        })
      );

      setSelected(null);

      if (navigate) {
        navigate("report");
      }
    };

  return (
    <div className="page">

      <section className="page-heading reports-live-heading">

        <div>

          <span className="eyebrow">
            TRANSPARENCY
          </span>

          <h1>
            My Reports
          </h1>

          <p>
            Review submitted civic reports and quickly
            report a similar current issue again.
          </p>

        </div>

        <button
          type="button"
          className="button primary"
          onClick={() =>
            navigate &&
            navigate("report")
          }
        >
          + New Report
        </button>

      </section>

      <div className="reports-summary">

        <Summary
          label="Total reports"
          value={stats.total}
        />

        <Summary
          label="Active"
          value={stats.active}
        />

        <Summary
          label="Resolved"
          value={stats.resolved}
        />

        <Summary
          label="Rejected"
          value={stats.rejected}
        />

      </div>

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      <div className="reports-filter-bar">

        {filters.map(
          (item) => (

            <button
              key={item}
              type="button"
              className={
                filter === item
                  ? "reports-filter active"
                  : "reports-filter"
              }
              onClick={() =>
                setFilter(item)
              }
            >
              {item}
            </button>

          )
        )}

        <button
          type="button"
          className="reports-refresh"
          onClick={load}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "↻ Refresh"}
        </button>

      </div>

      <div className="reports-live-list">

        {filtered.map(
          (report) => (

            <article
              key={
                report.reportId ||
                report._id
              }
              className="reports-live-card"
            >

              <div className="reports-live-icon">
                ✓
              </div>

              <div>

                <div className="cp-report-card-top">

                  <div>

                    <span className="eyebrow">
                      {report.category ||
                        "Civic Issue"}
                    </span>

                    <h3>
                      {report.issueType ||
                        report.title ||
                        "Civic Report"}
                    </h3>

                  </div>

                  <span className="cp-status-pill">
                    {report.status ||
                      "Submitted"}
                  </span>

                </div>

                <p>
                  {report.description ||
                    "No description."}
                </p>

                <div className="cp-report-meta">

                  <span>
                    ID:
                    {" "}
                    {report.reportId ||
                      report._id}
                  </span>

                  <span>
                    {formatDate(
                      report.createdAt
                    )}
                  </span>

                  <span>
                    {report.location?.address ||
                      "Location captured"}
                  </span>

                </div>

                <div className="cp-report-actions">

                  <button
  type="button"
  className="button soft"
  onMouseDown={(event) => {
    event.preventDefault();
    event.stopPropagation();
  }}
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();

    setSelected({
      ...report
    });

    setSelectedReportId(
      String(
        report.reportId ||
        report._id ||
        ""
      )
    );
  }}
>
  View Details
</button>

                  <button
                    type="button"
                    className="button soft"
                    onClick={() =>
                      startReReport(
                        report
                      )
                    }
                  >
                    ↻ Report Similar Issue
                  </button>

                  <ShareActions
                    report={report}
                    compact={true}
                  />

                </div>

              </div>

            </article>

          )
        )}

      </div>

      {!filtered.length && (
        <div className="cp-empty-reports">
          No reports in this view.
        </div>
      )}

      {selected && selectedReportId && (

        <div className="cp-report-modal">

          <div className="cp-report-modal-card" data-testid="report-details-modal">

            <button
              type="button"
              className="cp-modal-close"
              onClick={() => {
                setSelected(null);
                setSelectedReportId("");
              }}
            >
              ×
            </button>

            <span className="eyebrow">
              REPORT DETAILS
            </span>

            <h2>
              {selected.issueType ||
                "Civic Report"}
            </h2>

            <div className="cp-report-detail-grid">

              <Detail
                label="Report ID"
                value={
                  selected.reportId ||
                  selected._id
                }
              />

              <Detail
                label="Status"
                value={
                  selected.status ||
                  "Submitted"
                }
              />

              <Detail
                label="Category"
                value={
                  selected.category ||
                  "Other"
                }
              />

              <Detail
                label="Priority"
                value={
                  selected.priority ||
                  "Medium"
                }
              />

              <Detail
                label="Date"
                value={
                  formatDate(
                    selected.createdAt
                  )
                }
              />

              <Detail
                label="Location"
                value={
                  selected.location?.address ||
                  "GPS captured"
                }
              />

            </div>

            <div className="cp-report-full-detail">

              <span>
                Description
              </span>

              <p>
                {selected.description ||
                  "No description."}
              </p>

            </div>

            {selected.images?.[0]?.dataUrl && (
              <img
                data-testid="report-detail-image"
                className="cp-detail-image"
                src={
                  selected.images[0].dataUrl
                }
                alt="Reported issue"
              />
            )}

            <div className="cp-detail-actions">

              <button
                type="button"
                className="button primary"
                onClick={() =>
                  startReReport(
                    selected
                  )
                }
              >
                ↻ Report Similar Issue
              </button>

              <ShareActions
                report={selected}
              />

              <ReportPdfActions report={selected} />
              <StatusControl
                report={selected}
                onSaved={load}
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

function Summary({
  label,
  value
}) {

  return (
    <div>
      <small>
        {label}
      </small>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function Detail({
  label,
  value
}) {

  return (
    <div className="cp-report-detail-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}
