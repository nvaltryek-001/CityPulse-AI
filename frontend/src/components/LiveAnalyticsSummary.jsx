import React, {
  useEffect,
  useState
} from "react";

import {
  fetchAnalytics
} from "../services/analyticsService.js";

function Metric({
  label,
  value,
  detail
}) {

  return (
    <div className="analytics-metric-card">

      <span className="analytics-metric-label">
        {label}
      </span>

      <strong className="analytics-metric-value">
        {value}
      </strong>

      {detail && (
        <span className="analytics-metric-detail">
          {detail}
        </span>
      )}

    </div>
  );
}

export default function LiveAnalyticsSummary() {

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    let mounted = true;

    fetchAnalytics()
      .then(result => {

        if (mounted) {
          setData(result);
        }

      })
      .catch(err => {

        if (mounted) {
          setError(
            err?.message ||
            "Analytics unavailable."
          );
        }

      })
      .finally(() => {

        if (mounted) {
          setLoading(false);
        }

      });

    return () => {
      mounted = false;
    };

  }, []);

  if (loading) {

    return (
      <section className="analytics-live-card">
        Loading live civic analytics...
      </section>
    );
  }

  if (error) {

    return (
      <section className="analytics-live-card">
        <strong>
          Analytics unavailable
        </strong>

        <p>
          {error}
        </p>
      </section>
    );
  }

  const summary =
    data?.summary || {};

  return (
    <section className="analytics-live">

      <div className="analytics-live-header">

        <div>
          <span className="analytics-eyebrow">
            LIVE CITY DATA
          </span>

          <h2>
            Civic issue intelligence
          </h2>

          <p>
            Analytics generated from
            CityPulse reports stored in
            MongoDB.
          </p>
        </div>

        <span className="analytics-live-badge">
          ● LIVE
        </span>

      </div>

      <div className="analytics-metrics-grid">

        <Metric
          label="Total Reports"
          value={
            summary.total ?? 0
          }
        />

        <Metric
          label="Open"
          value={
            summary.open ?? 0
          }
        />

        <Metric
          label="In Progress"
          value={
            summary.inProgress ?? 0
          }
        />

        <Metric
          label="Resolved"
          value={
            summary.resolved ?? 0
          }
        />

        <Metric
          label="Critical"
          value={
            summary.critical ?? 0
          }
        />

        <Metric
          label="High Priority"
          value={
            summary.high ?? 0
          }
        />

        <Metric
          label="Resolution Rate"
          value={
            `${summary.resolutionRate ?? 0}%`
          }
        />

      </div>

    </section>
  );
}
