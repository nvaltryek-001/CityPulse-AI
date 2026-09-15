import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentReport,
  submitReport,
  formatReportId
} from "../services/reportFlowService";
import ShareCenter from "../components/ShareCenter";

export default function CivicReport() {
  const navigate = useNavigate();

  const [report, setReport] = useState(
    getCurrentReport() || {}
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(
    Boolean(report?.submitted)
  );
  const [offline, setOffline] = useState(
    Boolean(report?.offlineQueued)
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setReport(getCurrentReport() || {});
  }, []);

  async function handleSubmit() {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const result =
        await submitReport(report);

      setReport(
        getCurrentReport() || report
      );

      setSubmitted(true);
      setOffline(Boolean(result?.offline));
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
        "Unable to submit report."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const reportId = formatReportId(report);

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">
            STEP 4 · CIVIC REPORT
          </span>

          <h1>
            {submitted
              ? "Report Ready"
              : "Review Civic Report"}
          </h1>

          <p>
            Verify the information before sending
            the civic complaint into CityPulse.
          </p>
        </div>

        <button
          className="btn secondary"
          onClick={() => navigate("/analysis")}
        >
          ← AI Analysis
        </button>
      </section>

      {submitted && (
        <section className="success-card">
          <div className="success-icon">✓</div>

          <div>
            <span className="eyebrow">
              {offline
                ? "QUEUED OFFLINE"
                : "SUBMITTED"}
            </span>

            <h2>
              {offline
                ? "Saved for automatic sync"
                : "Civic report submitted successfully"}
            </h2>

            <p>
              Report ID:{" "}
              <strong>{reportId}</strong>
            </p>
          </div>
        </section>
      )}

      {error && (
        <section className="error-card">
          <strong>Submission failed</strong>
          <p>{error}</p>
        </section>
      )}

      <div className="report-grid">
        <section className="integration-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">
                OFFICIAL REPORT
              </span>
              <h2>
                {report.issueType ||
                  report.category ||
                  "Civic Issue"}
              </h2>
            </div>

            <span className="priority-pill">
              {report?.aiAnalysis?.priority ||
                report.priority ||
                "Medium"}
            </span>
          </div>

          <div className="report-details">
            <div>
              <span>Report ID</span>
              <strong>{reportId}</strong>
            </div>

            <div>
              <span>Issue</span>
              <strong>
                {report.issueType ||
                  report.category ||
                  "General"}
              </strong>
            </div>

            <div>
              <span>Department</span>
              <strong>
                {report?.aiAnalysis?.department ||
                  "Civic Administration"}
              </strong>
            </div>

            <div>
              <span>Severity</span>
              <strong>
                {report?.aiAnalysis?.severity ||
                  report.severity ||
                  "Medium"}
              </strong>
            </div>

            <div>
              <span>Location</span>
              <strong>
                {report?.location?.address ||
                  report.location ||
                  "Captured location"}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {offline
                  ? "Pending Sync"
                  : submitted
                    ? "Submitted"
                    : "Draft"}
              </strong>
            </div>
          </div>

          <div className="analysis-section">
            <h3>Description</h3>
            <p>
              {report.description ||
                "No description provided."}
            </p>
          </div>

          {report?.aiAnalysis?.recommendation && (
            <div className="analysis-section">
              <h3>AI Recommendation</h3>
              <p>
                {report.aiAnalysis.recommendation}
              </p>
            </div>
          )}

          {!submitted && (
            <button
              className="btn primary full-width"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting
                ? "Submitting..."
                : "Submit Civic Report →"}
            </button>
          )}
        </section>

        <aside className="side-stack">
          {submitted && (
            <ShareCenter report={report} />
          )}

          <section className="integration-card">
            <span className="eyebrow">
              WHAT HAPPENS NEXT
            </span>

            <div className="timeline">
              <div>
                <b>01</b>
                <span>
                  Report stored securely
                </span>
              </div>

              <div>
                <b>02</b>
                <span>
                  Civic department receives issue
                </span>
              </div>

              <div>
                <b>03</b>
                <span>
                  Status can be tracked from History
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
