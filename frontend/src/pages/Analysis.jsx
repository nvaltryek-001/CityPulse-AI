import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentReport,
  analyzeReport
} from "../services/reportFlowService";
import {
  getReportImages
} from "../services/imageService";

export default function Analysis() {
  const navigate = useNavigate();

  const [report, setReport] = useState(
    getCurrentReport() || {}
  );

  const [images, setImages] = useState(
    getReportImages() || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analysis = report?.aiAnalysis;

  useEffect(() => {
    const current = getCurrentReport() || {};

    setReport(current);
    setImages(getReportImages() || []);

    if (!current.analysisCompleted) {
      runAnalysis();
    }
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError("");

    try {
      const current = getCurrentReport() || {};
      const currentImages = getReportImages() || [];

      const payload = {
        issueType:
          current.issueType ||
          current.category ||
          "Civic Issue",

        description:
          current.description || "",

        location:
          current.location || {},

        severity:
          current.severity || 3,

        trafficLevel:
          current.trafficLevel || "Medium",

        safetyRisk:
          current.safetyRisk || 3,

        images: currentImages
      };

      const updated =
        await analyzeReport(payload);

      setReport(updated);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
        "AI analysis failed. Make sure the backend and Gemini API are running."
      );
    } finally {
      setLoading(false);
    }
  }

  const confidence =
    Number(analysis?.confidence || 0);

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <span className="eyebrow">STEP 3</span>
          <h1>AI Analysis</h1>
          <p>
            Gemini AI analyzes the reported civic issue
            and prepares the official report.
          </p>
        </div>

        <button
          className="btn secondary"
          onClick={() => navigate("/photo")}
        >
          ← Evidence
        </button>
      </section>

      {loading && (
        <section className="integration-card">
          <div className="loading-orb">✦</div>
          <h2>Analyzing civic evidence...</h2>
          <p>
            Gemini Vision is reviewing the issue,
            severity and uploaded evidence.
          </p>

          <div className="progress-track">
            <div className="progress-value animated" />
          </div>
        </section>
      )}

      {error && (
        <section className="error-card">
          <strong>AI analysis unavailable</strong>
          <p>{error}</p>

          <button
            className="btn primary"
            onClick={runAnalysis}
          >
            Try Again
          </button>
        </section>
      )}

      {!loading && analysis && (
        <div className="analysis-grid">
          <section className="integration-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">
                  DETECTION
                </span>
                <h2>
                  {analysis.detectedIssue ||
                    report.issueType ||
                    "Civic issue"}
                </h2>
              </div>

              <span className="ai-badge">
                AI VERIFIED
              </span>
            </div>

            <div className="metric-grid">
              <div className="metric-box">
                <span>Category</span>
                <strong>
                  {analysis.category ||
                    report.issueType ||
                    "General"}
                </strong>
              </div>

              <div className="metric-box">
                <span>Severity</span>
                <strong>
                  {analysis.severity ||
                    report.severity ||
                    "Medium"}
                </strong>
              </div>

              <div className="metric-box">
                <span>Priority</span>
                <strong>
                  {analysis.priority ||
                    "Medium"}
                </strong>
              </div>

              <div className="metric-box">
                <span>Confidence</span>
                <strong>
                  {confidence
                    ? `${Math.round(
                        confidence <= 1
                          ? confidence * 100
                          : confidence
                      )}%`
                    : "N/A"}
                </strong>
              </div>
            </div>

            <div className="analysis-section">
              <h3>Observations</h3>

              {Array.isArray(
                analysis.observations
              ) ? (
                <ul>
                  {analysis.observations.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  {analysis.observations ||
                    "No additional observations."}
                </p>
              )}
            </div>

            <div className="analysis-section">
              <h3>Recommended Action</h3>
              <p>
                {analysis.recommendation ||
                  "Review the issue and forward it to the appropriate civic department."}
              </p>
            </div>

            <div className="analysis-section">
              <h3>Responsible Department</h3>
              <p>
                {analysis.department ||
                  "Civic Administration"}
              </p>
            </div>

            <button
              className="btn primary full-width"
              onClick={() =>
                navigate("/civic-report")
              }
            >
              Generate Civic Report →
            </button>
          </section>

          <aside className="side-stack">
            <section className="integration-card">
              <span className="eyebrow">
                EVIDENCE
              </span>

              <h3>
                {images.length} image
                {images.length === 1
                  ? ""
                  : "s"} uploaded
              </h3>

              <div className="mini-image-grid">
                {images.slice(0, 4).map(
                  (image, index) => (
                    <img
                      key={index}
                      src={image.dataUrl || image}
                      alt={`Evidence ${index + 1}`}
                    />
                  )
                )}
              </div>
            </section>

            <section className="integration-card">
              <span className="eyebrow">
                LOCATION
              </span>

              <h3>
                {report?.location?.address ||
                  report?.location ||
                  "Location captured"}
              </h3>

              {report?.location?.latitude && (
                <p>
                  {report.location.latitude.toFixed
                    ? report.location.latitude.toFixed(6)
                    : report.location.latitude}
                  {" · "}
                  {report.location.longitude?.toFixed
                    ? report.location.longitude.toFixed(6)
                    : report.location.longitude}
                </p>
              )}
            </section>
          </aside>
        </div>
      )}
    </main>
  );
}
