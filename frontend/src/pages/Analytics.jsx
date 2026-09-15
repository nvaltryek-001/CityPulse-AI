import React, { useEffect, useMemo, useState } from "react";
import {
  loadReports
} from "../services/reportFlowService";

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);

    try {
      const data = await loadReports();
      setReports(
        Array.isArray(data)
          ? data
          : []
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();

    window.addEventListener(
      "online",
      refresh
    );

    return () =>
      window.removeEventListener(
        "online",
        refresh
      );
  }, []);

  const stats = useMemo(() => {
    const total = reports.length;

    const critical = reports.filter(item => {
      const priority =
        item.priority ||
        item?.aiAnalysis?.priority ||
        "";

      const severity =
        Number(
          item.severity ||
          item?.aiAnalysis?.severity ||
          0
        );

      return (
        String(priority)
          .toLowerCase() === "critical" ||
        severity >= 5
      );
    }).length;

    const resolved = reports.filter(item =>
      ["resolved", "closed", "completed"]
        .includes(
          String(item.status || "")
            .toLowerCase()
        )
    ).length;

    const pending =
      total - resolved;

    const categories = {};

    reports.forEach(item => {
      const category =
        item.category ||
        item.issueType ||
        "General";

      categories[category] =
        (categories[category] || 0) + 1;
    });

    const categoryRows =
      Object.entries(categories)
        .sort((a, b) => b[1] - a[1]);

    return {
      total,
      critical,
      resolved,
      pending,
      categoryRows
    };
  }, [reports]);

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">
            CITY INTELLIGENCE
          </span>

          <h1>Analytics</h1>

          <p>
            Real civic issue metrics from
            CityPulse reports.
          </p>
        </div>

        <button
          className="btn secondary"
          onClick={refresh}
        >
          ↻ Refresh
        </button>
      </section>

      <section className="analytics-kpis">
        <div className="kpi-card">
          <span>Total Reports</span>
          <strong>{stats.total}</strong>
          <small>All submitted reports</small>
        </div>

        <div className="kpi-card">
          <span>Critical</span>
          <strong>{stats.critical}</strong>
          <small>High-priority attention</small>
        </div>

        <div className="kpi-card">
          <span>Resolved</span>
          <strong>{stats.resolved}</strong>
          <small>Completed issues</small>
        </div>

        <div className="kpi-card">
          <span>Open</span>
          <strong>{stats.pending}</strong>
          <small>Awaiting resolution</small>
        </div>
      </section>

      <section className="analytics-grid">
        <div className="integration-card">
          <span className="eyebrow">
            ISSUE BREAKDOWN
          </span>

          <h2>Reports by Category</h2>

          {loading ? (
            <p>Loading analytics...</p>
          ) : stats.categoryRows.length === 0 ? (
            <div className="empty-state">
              <h3>No report data yet</h3>
              <p>
                Submit your first civic report
                to populate analytics.
              </p>
            </div>
          ) : (
            <div className="bar-list">
              {stats.categoryRows.map(
                ([category, count]) => {
                  const max =
                    stats.categoryRows[0][1];

                  const width =
                    Math.max(
                      8,
                      (count / max) * 100
                    );

                  return (
                    <div
                      className="bar-row"
                      key={category}
                    >
                      <div className="bar-label">
                        <span>{category}</span>
                        <strong>{count}</strong>
                      </div>

                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${width}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="integration-card">
          <span className="eyebrow">
            STATUS
          </span>

          <h2>Resolution Overview</h2>

          <div className="resolution-ring">
            <div>
              <strong>
                {stats.total
                  ? Math.round(
                      (stats.resolved /
                        stats.total) *
                        100
                    )
                  : 0}
                %
              </strong>

              <span>resolved</span>
            </div>
          </div>

          <div className="resolution-legend">
            <div>
              <span />
              Resolved
              <strong>
                {stats.resolved}
              </strong>
            </div>

            <div>
              <span />
              Open
              <strong>
                {stats.pending}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
