import React from "react";
import "lucide-react";

import { cityPulseApi } from "./services/cityPulseApi.js";

import ReportFlow from "./components/ReportFlow.jsx";
import RealReports from "./components/RealReports.jsx";
import RealAnalytics from "./components/RealAnalytics.jsx";
import CivicExplorer from "./components/CivicExplorer.jsx";
import StatusControl from "./components/StatusControl.jsx";

import "./styles.css";

const navItems = [
  ["home", "Home"],
  ["report", "Report Issue"],
  ["explore", "Explore"],
  ["analytics", "Analytics"],
  ["reports", "My Reports"],
  ["updates", "Updates"]
];

function HomePage({
  reports,
  datasetStats,
  navigate
}) {
  const total =
    Number(
      datasetStats?.total
    ) || 0;

  const liveCount =
    reports.length;

  const resolved =
    reports.filter(
      (report) =>
        report.status ===
        "Resolved"
    ).length;

  const open =
    reports.filter(
      (report) =>
        report.status ===
        "Submitted" ||
        report.status ===
        "Assigned" ||
        report.status ===
        "In Progress"
    ).length;

  const recent =
    reports.slice(
      0,
      4
    );

  return (
    <div className="cpv-page">

      <section className="cpv-hero">

        <div>
          <span className="cpv-eyebrow">
            CITYPULSE CIVIC ACTION
          </span>

          <h1>
            Better cities start with
            people who care.
          </h1>

          <p>
            Spot an issue, capture the
            current location, add evidence
            and create a complete civic
            report in minutes.
          </p>

          <div className="cpv-hero-actions">

            <button
              type="button"
              className="cpv-primary"
              onClick={() =>
                navigate("report")
              }
            >
              Report an Issue
            </button>

            <button
              type="button"
              className="cpv-secondary"
              onClick={() =>
                navigate("explore")
              }
            >
              Explore Civic Data
            </button>

          </div>
        </div>

        <div className="cpv-hero-art">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

      </section>

      <section className="cpv-metric-grid">

        <div>
          <span>
            Historical records
          </span>

          <strong>
            {total.toLocaleString()}
          </strong>

          <small>
            BBMP civic intelligence
          </small>
        </div>

        <div>
          <span>
            Current reports
          </span>

          <strong>
            {liveCount}
          </strong>

          <small>
            MongoDB records
          </small>
        </div>

        <div>
          <span>
            Open / active
          </span>

          <strong>
            {open}
          </strong>

          <small>
            Current CityPulse reports
          </small>
        </div>

        <div>
          <span>
            Resolved
          </span>

          <strong>
            {resolved}
          </strong>

          <small>
            Current CityPulse reports
          </small>
        </div>

      </section>

      <section className="cpv-dashboard-grid">

        <div className="cpv-card">

          <div className="cpv-section-head compact">

            <span className="cpv-eyebrow">
              HOW IT WORKS
            </span>

            <h2>
              From observation to report
            </h2>

          </div>

          <div className="cpv-process">

            <div>
              <b>01</b>
              <strong>
                Describe
              </strong>
              <span>
                Explain the issue you see.
              </span>
            </div>

            <div>
              <b>02</b>
              <strong>
                Locate
              </strong>
              <span>
                Capture your current GPS.
              </span>
            </div>

            <div>
              <b>03</b>
              <strong>
                Evidence
              </strong>
              <span>
                Add a fresh problem photo.
              </span>
            </div>

            <div>
              <b>04</b>
              <strong>
                Report
              </strong>
              <span>
                Save the report and PDF.
              </span>
            </div>

          </div>

        </div>

        <div className="cpv-card">

          <div className="cpv-section-head compact">

            <span className="cpv-eyebrow">
              DATA CONTEXT
            </span>

            <h2>
              Use history without copying it
            </h2>

          </div>

          <p className="cpv-large-copy">
            BBMP records help identify
            recurring civic issues and
            useful report terminology.
            Every new CityPulse submission
            still uses fresh GPS, timestamp
            and evidence.
          </p>

          <button
            type="button"
            className="cpv-secondary"
            onClick={() =>
              navigate("explore")
            }
          >
            Explore the dataset
          </button>

        </div>

      </section>

      <section className="cpv-card">

        <div className="cpv-section-head compact">

          <div>
            <span className="cpv-eyebrow">
              RECENT ACTIVITY
            </span>

            <h2>
              Latest CityPulse reports
            </h2>
          </div>

          <button
            type="button"
            className="cpv-link"
            onClick={() =>
              navigate("reports")
            }
          >
            View all reports
          </button>

        </div>

        {recent.length === 0 && (
          <div className="cpv-empty">
            No current reports yet.
          </div>
        )}

        {recent.length > 0 && (
          <div className="cpv-live-list">

            {recent.map(
              (report) => (
                <article
                  key={
                    report.reportId ||
                    report._id
                  }
                >

                  <div>
                    <span>
                      {report.category}
                    </span>

                    <strong>
                      {report.issueType}
                    </strong>

                    <p>
                      {report.description}
                    </p>
                  </div>

                  <span className="cpv-status">
                    {report.status}
                  </span>

                </article>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

function UpdatesPage({
  reports,
  navigate,
  onSaved
}) {
  return (
    <div className="cpv-page">

      <div className="cpv-page-intro">
        <span className="cpv-eyebrow">
          CIVIC UPDATES
        </span>

        <h1>
          Updates
        </h1>

        <p>
          Review the latest report status
          and manually record work progress.
        </p>
      </div>

      <section className="cpv-metric-grid">

        <div>
          <span>
            Total
          </span>

          <strong>
            {reports.length}
          </strong>
        </div>

        <div>
          <span>
            Submitted
          </span>

          <strong>
            {
              reports.filter(
                (r) =>
                  r.status ===
                  "Submitted"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>
            In progress
          </span>

          <strong>
            {
              reports.filter(
                (r) =>
                  r.status ===
                  "In Progress"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>
            Resolved
          </span>

          <strong>
            {
              reports.filter(
                (r) =>
                  r.status ===
                  "Resolved"
              ).length
            }
          </strong>
        </div>

      </section>

      <section className="cpv-card">

        {reports.length === 0 && (
          <div className="cpv-empty">
            No current report updates.
          </div>
        )}

        {reports.length > 0 && (
          <div className="cpv-update-list">

            {reports.map(
              (report) => (
                <article
                  key={
                    report.reportId ||
                    report._id
                  }
                >

                  <div className="cpv-update-dot">
                    ✓
                  </div>

                  <div className="cpv-update-main">
                    <span>
                      {report.category}
                    </span>

                    <strong>
                      {report.issueType}
                    </strong>

                    <p>
                      {report.description}
                    </p>

                    {report.statusNote && (
                      <div className="cpv-work-note">
                        <b>
                          Latest work update:
                        </b>

                        <span>
                          {report.statusNote}
                        </span>
                      </div>
                    )}

                  </div>

                  <div className="cpv-update-status">
                    <span>
                      CURRENT STATUS
                    </span>

                    <strong>
                      {report.status}
                    </strong>
                  </div>

                  <StatusControl
                    report={report}
                    onSaved={() => {
                      if (onSaved) {
                        onSaved();
                      }
                    }}
                  />

                </article>
              )
            )}

          </div>
        )}

      </section>

      <button
        type="button"
        className="cpv-secondary"
        onClick={() =>
          navigate("reports")
        }
      >
        Open My Reports
      </button>

    </div>
  );
}

export default function App() {
  const [page, setPage] =
    React.useState("home");

  const [reports, setReports] =
    React.useState([]);

  const [datasetStats, setDatasetStats] =
    React.useState({
      total: 0
    });

  const [backendOnline, setBackendOnline] =
    React.useState(false);

  const load =
    React.useCallback(
      async () => {
        const results =
          await Promise.allSettled([
            cityPulseApi.health(),
            cityPulseApi.reports(),
            cityPulseApi.civicDatasetAnalytics()
          ]);

        const health =
          results[0];

        const reportResult =
          results[1];

        const datasetResult =
          results[2];

        setBackendOnline(
          health.status ===
          "fulfilled"
        );

        if (
          reportResult.status ===
          "fulfilled"
        ) {
          setReports(
            Array.isArray(
              reportResult.value?.data
            )
              ? reportResult.value.data
              : []
          );
        }

        if (
          datasetResult.status ===
          "fulfilled"
        ) {
          setDatasetStats(
            datasetResult.value ||
            { total: 0 }
          );
        }
      },
      []
    );

  React.useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    load();

    const interval =
      window.setInterval(
        load,
        15000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [load]);

  React.useEffect(() => {
    const handler =
      (event) => {
        if (
          typeof event.detail ===
          "string"
        ) {
          setPage(
            event.detail
          );

          window.scrollTo(
            0,
            0
          );
        }
      };

    window.addEventListener(
      "citypulse:navigate",
      handler
    );

    return () =>
      window.removeEventListener(
        "citypulse:navigate",
        handler
      );
  }, []);

  const navigate =
    (nextPage) => {
      setPage(nextPage);

      window.scrollTo(
        0,
        0
      );
    };

  let content =
    <HomePage
      reports={reports}
      datasetStats={datasetStats}
      navigate={navigate}
    />;

  if (page === "report") {
    content =
      <ReportFlow
        onComplete={() => {
          load();
        }}
      />;
  }

  if (page === "explore") {
    content =
      <CivicExplorer />;
  }

  if (page === "analytics") {
    content =
      <div className="cpv-page">
        <RealAnalytics />
      </div>;
  }

  if (page === "reports") {
    content =
      <div className="cpv-page">
        <RealReports
          initialReports={
            reports
          }
          navigate={
            navigate
          }
        />
      </div>;
  }

  if (page === "updates") {
    content =
      <UpdatesPage
        reports={
          reports
        }
        navigate={
          navigate
        }
      />;
  }

  return (
    <div className="cpv-app">

      <aside className="cpv-sidebar">

        <button
          type="button"
          className="cpv-brand"
          onClick={() =>
            navigate("home")
          }
        >
          <div className="cpv-brand-mark">
            CP
          </div>

          <div>
            <strong>
              CityPulse AI
            </strong>

            <span>
              People. Places. Progress.
            </span>
          </div>
        </button>

        <nav className="cpv-nav">

          {navItems.map(
            ([id, label]) => (
              <button
                type="button"
                key={id}
                className={
                  page === id
                    ? "cpv-nav-item active"
                    : "cpv-nav-item"
                }
                onClick={() =>
                  navigate(id)
                }
              >
                <span>
                  {label}
                </span>
              </button>
            )
          )}

        </nav>

        <div className="cpv-sidebar-footer">

          <div className="cpv-civic-art">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <strong>
            Cleaner cities.
          </strong>

          <span>
            Stronger communities.
          </span>

          <small>
            Every report helps.
          </small>

        </div>

      </aside>

      <main className="cpv-main">

        <header className="cpv-topbar">

          <div className="cpv-search">
            <span>
              ⌕
            </span>

            <input
              placeholder="Search issues, report IDs or civic records..."
              aria-label="Search"
            />
          </div>

          <div className="cpv-topbar-right">

            <span
              className={
                backendOnline
                  ? "cpv-api connected"
                  : "cpv-api"
              }
            >
              <i></i>

              {backendOnline
                ? "API connected"
                : "API offline"}
            </span>

            <div className="cpv-citizen">
              <b>
                C
              </b>

              <div>
                <strong>
                  Citizen
                </strong>

                <span>
                  Active
                </span>
              </div>
            </div>

          </div>

        </header>

        {content}

      </main>

    </div>
  );
}
