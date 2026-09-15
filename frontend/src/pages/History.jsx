import React, { useEffect, useState } from "react";
import {
  loadReports
} from "../services/reportFlowService";
import {
  getPendingReports
} from "../services/offlineDb";

export default function History() {
  const [reports, setReports] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);

    try {
      const [remote, offline] =
        await Promise.all([
          loadReports(),
          getPendingReports()
        ]);

      setReports(
        Array.isArray(remote)
          ? remote
          : []
      );

      setPending(
        Array.isArray(offline)
          ? offline
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

    window.addEventListener(
      "citypulse:report-updated",
      refresh
    );

    return () => {
      window.removeEventListener(
        "online",
        refresh
      );

      window.removeEventListener(
        "citypulse:report-updated",
        refresh
      );
    };
  }, []);

  const combined = [
    ...pending.map(item => ({
      ...item,
      __offline: true
    })),
    ...reports
  ];

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">
            REPORT HISTORY
          </span>

          <h1>Your Civic Reports</h1>

          <p>
            Track submitted and offline-pending
            reports from one place.
          </p>
        </div>

        <button
          className="btn secondary"
          onClick={refresh}
        >
          ↻ Refresh
        </button>
      </section>

      <section className="history-summary">
        <div>
          <span>Total</span>
          <strong>{combined.length}</strong>
        </div>

        <div>
          <span>Submitted</span>
          <strong>{reports.length}</strong>
        </div>

        <div>
          <span>Pending Sync</span>
          <strong>{pending.length}</strong>
        </div>
      </section>

      <section className="integration-card history-table-card">
        {loading ? (
          <div className="empty-state">
            Loading report history...
          </div>
        ) : combined.length === 0 ? (
          <div className="empty-state">
            <div>▣</div>
            <h3>No reports yet</h3>
            <p>
              Your civic reports will appear here.
            </p>
          </div>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {combined.map((item, index) => (
                  <tr
                    key={
                      item._id ||
                      item.reportId ||
                      item.id ||
                      index
                    }
                  >
                    <td>
                      <strong>
                        {item.reportId ||
                          item.id ||
                          item._id ||
                          "PENDING"}
                      </strong>
                    </td>

                    <td>
                      {item.category ||
                        item.issueType ||
                        "General"}
                    </td>

                    <td>
                      {item.priority ||
                        item?.aiAnalysis?.priority ||
                        "Medium"}
                    </td>

                    <td>
                      <span className="status-tag">
                        {item.__offline
                          ? "Pending Sync"
                          : item.status ||
                            "Submitted"}
                      </span>
                    </td>

                    <td>
                      {item?.location?.address ||
                        item.location ||
                        "—"}
                    </td>

                    <td>
                      {item.createdAt ||
                      item.timestamp
                        ? new Date(
                            item.createdAt ||
                              item.timestamp
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
