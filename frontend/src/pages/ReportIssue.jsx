import { submitReportProductionSafe } from "../services/reportSubmissionService.js";
import React, {
  useEffect,
  useState
} from "react";

import LocationPicker from "../components/LocationPicker";

import {
  getCurrentReport,
  saveCurrentReport,
  saveDraftReport
} from "../services/reportService";

export default function ReportIssue({
  navigate
}) {
  const existing =
    getCurrentReport() || {};

  const [
    issueType,
    setIssueType
  ] = useState(
    existing.issueType || ""
  );

  const [
    severity,
    setSeverity
  ] = useState(
    existing.severity || 3
  );

  const [
    traffic,
    setTraffic
  ] = useState(
    existing.traffic || "Medium"
  );

  const [
    safetyRisk,
    setSafetyRisk
  ] = useState(
    existing.safetyRisk || 3
  );

  const [
    similarReports,
    setSimilarReports
  ] = useState(
    existing.similarReports || "No"
  );

  const [
    description,
    setDescription
  ] = useState(
    existing.description || ""
  );

  const [
    location,
    setLocation
  ] = useState(
    existing.locationData || {
      address:
        existing.location || "",
      latitude:
        existing.latitude ??
        null,
      longitude:
        existing.longitude ??
        null,
      accuracy:
        existing.accuracy ??
        null,
      source:
        existing.latitude !== null &&
        existing.latitude !== undefined
          ? "gps"
          : "",
      capturedAt:
        null
    }
  );

  const [
    errors,
    setErrors
  ] = useState({});

  useEffect(() => {
    const draft =
      getCurrentReport();

    if (!draft) {
      return;
    }

    if (
      draft.issueType
    ) {
      setIssueType(
        draft.issueType
      );
    }

    if (
      draft.description
    ) {
      setDescription(
        draft.description
      );
    }
  }, []);

  const validate =
    () => {
      const next = {};

      if (!issueType) {
        next.issueType =
          "Please select the issue type.";
      }

      if (
        !description.trim()
      ) {
        next.description =
          "Please describe the civic issue.";
      }

      if (
        description.length >
        500
      ) {
        next.description =
          "Description cannot exceed 500 characters.";
      }

      if (
        !location?.address &&
        !(
          location?.latitude !==
            null &&
          location?.latitude !==
            undefined
        )
      ) {
        next.location =
          "Please enter a location or use your current GPS location.";
      }

      setErrors(
        next
      );

      return (
        Object.keys(next)
          .length === 0
      );
    };

  const persist =
    () => {
      const report = {
        ...existing,

        issueType,

        severity:
          Number(severity),

        traffic,

        safetyRisk:
          Number(safetyRisk),

        similarReports,

        description:
          description.trim(),

        location:
          location?.address ||
          "",

        locationData:
          location,

        latitude:
          location?.latitude ??
          null,

        longitude:
          location?.longitude ??
          null,

        accuracy:
          location?.accuracy ??
          null,

        locationSource:
          location?.source ||
          "",

        updatedAt:
          new Date().toISOString()
      };

      saveCurrentReport(
        report
      );

      saveDraftReport(
        report
      );

      return report;
    };

  const handleContinue =
    () => {
      if (!validate()) {
        return;
      }

      persist();

      navigate(
        "/photo"
      );
    };

  return (
    <div className="cp-page cp-report-page">

      <div className="cp-workflow-header">

        <div>
          <span className="cp-eyebrow">
            STEP 01
          </span>

          <h1>
            Report a Civic Issue
          </h1>

          <p>
            Tell us what happened. CityPulse AI
            will analyze the evidence and prepare
            a structured civic report.
          </p>
        </div>

        <div className="cp-report-badge">
          No account required
        </div>

      </div>

      <div className="cp-progress">

        <div className="cp-progress-step active">
          <span>
            1
          </span>

          <label>
            Issue
          </label>
        </div>

        <div className="cp-progress-line active" />

        <div className="cp-progress-step">
          <span>
            2
          </span>

          <label>
            Location
          </label>
        </div>

        <div className="cp-progress-line" />

        <div className="cp-progress-step">
          <span>
            3
          </span>

          <label>
            Photos
          </label>
        </div>

        <div className="cp-progress-line" />

        <div className="cp-progress-step">
          <span>
            4
          </span>

          <label>
            AI Review
          </label>
        </div>

        <div className="cp-progress-line" />

        <div className="cp-progress-step">
          <span>
            5
          </span>

          <label>
            Report
          </label>
        </div>

      </div>

      <div className="cp-report-layout">

        <main className="cp-report-main">

          <section className="cp-form-card">

            <div className="cp-section-heading">
              <div>
                <span className="cp-eyebrow">
                  ISSUE DETAILS
                </span>

                <h2>
                  What needs attention?
                </h2>
              </div>
            </div>

            <div className="cp-form-grid">

              <div className="cp-form-field cp-full">

                <label>
                  Issue type
                </label>

                <select
                  value={
                    issueType
                  }
                  onChange={(event) =>
                    setIssueType(
                      event.target.value
                    )
                  }
                  className={
                    errors.issueType
                      ? "cp-input-error"
                      : ""
                  }
                >
                  <option value="">
                    Select issue type
                  </option>

                  <option value="Pothole">
                    Pothole / Road Damage
                  </option>

                  <option value="Garbage">
                    Garbage / Waste
                  </option>

                  <option value="Street Light">
                    Street Light
                  </option>

                  <option value="Water Supply">
                    Water Supply
                  </option>

                  <option value="Drainage">
                    Drainage / Flooding
                  </option>

                  <option value="Traffic Signal">
                    Traffic Signal
                  </option>

                  <option value="Footpath">
                    Footpath / Sidewalk
                  </option>

                  <option value="Public Safety">
                    Public Safety
                  </option>

                  <option value="Other">
                    Other Civic Issue
                  </option>

                </select>

                {errors.issueType && (
                  <span className="cp-field-error">
                    {errors.issueType}
                  </span>
                )}

              </div>

              <div className="cp-form-field">

                <label>
                  Severity
                </label>

                <div className="cp-range-wrap">

                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={
                      severity
                    }
                    onChange={(event) =>
                      setSeverity(
                        event.target.value
                      )
                    }
                  />

                  <strong>
                    {severity}/5
                  </strong>

                </div>

              </div>

              <div className="cp-form-field">

                <label>
                  Traffic impact
                </label>

                <select
                  value={
                    traffic
                  }
                  onChange={(event) =>
                    setTraffic(
                      event.target.value
                    )
                  }
                >
                  <option>
                    Low
                  </option>

                  <option>
                    Medium
                  </option>

                  <option>
                    High
                  </option>
                </select>

              </div>

              <div className="cp-form-field">

                <label>
                  Safety risk
                </label>

                <select
                  value={
                    safetyRisk
                  }
                  onChange={(event) =>
                    setSafetyRisk(
                      event.target.value
                    )
                  }
                >
                  <option value="1">
                    1 — Very Low
                  </option>

                  <option value="2">
                    2 — Low
                  </option>

                  <option value="3">
                    3 — Moderate
                  </option>

                  <option value="4">
                    4 — High
                  </option>

                  <option value="5">
                    5 — Critical
                  </option>
                </select>

              </div>

              <div className="cp-form-field">

                <label>
                  Similar report nearby?
                </label>

                <select
                  value={
                    similarReports
                  }
                  onChange={(event) =>
                    setSimilarReports(
                      event.target.value
                    )
                  }
                >
                  <option>
                    No
                  </option>

                  <option>
                    Maybe
                  </option>

                  <option>
                    Yes
                  </option>
                </select>

              </div>

              <div className="cp-form-field cp-full">

                <label>
                  Describe the issue
                </label>

                <textarea
                  rows="6"
                  maxLength="500"
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe what you see, where it is, how serious it is, and how it affects people..."
                  className={
                    errors.description
                      ? "cp-input-error"
                      : ""
                  }
                />

                <div className="cp-textarea-footer">

                  <span>
                    {description.length}/500
                  </span>

                  {errors.description && (
                    <span className="cp-field-error">
                      {errors.description}
                    </span>
                  )}

                </div>

              </div>

            </div>

          </section>

          <LocationPicker
            value={
              location
            }
            onChange={
              (next) => {
                setLocation(
                  next
                );

                setErrors(
                  (previous) => ({
                    ...previous,
                    location:
                      undefined
                  })
                );
              }
            }
          />

          {errors.location && (
            <div className="cp-location-validation">
              <span>
                !
              </span>

              {errors.location}
            </div>
          )}

          <div className="cp-report-footer">

            <button
              type="button"
              className="cp-back-btn"
              onClick={() =>
                navigate("/")
              }
            >
              ← Cancel
            </button>

            <button
              type="button"
              className="cp-primary-btn cp-next-btn"
              onClick={
                handleContinue
              }
            >
              Continue to Photos
              <span>
                →
              </span>
            </button>

          </div>

        </main>

        <aside className="cp-report-sidebar">

          <div className="cp-info-card">

            <div className="cp-info-icon">
              📍
            </div>

            <h3>
              Why location matters
            </h3>

            <p>
              Accurate coordinates help authorities
              identify the exact civic issue and
              reduce delays in field verification.
            </p>

            <ul>
              <li>
                Exact issue coordinates
              </li>

              <li>
                Optional street / landmark
              </li>

              <li>
                Accuracy information
              </li>

              <li>
                Map link in final report
              </li>
            </ul>

          </div>

          <div className="cp-info-card">

            <div className="cp-info-icon">
              🔐
            </div>

            <h3>
              Your report
            </h3>

            <p>
              No login is required. Your current
              frontend session stores the draft locally.
              Backend persistence will be added later.
            </p>

          </div>

          <div className="cp-photo-flow-card">

            <span>
              REPORT FLOW
            </span>

            <div className="cp-mini-flow active">
              <b>
                1
              </b>

              <div>
                Issue
              </div>
            </div>

            <div className="cp-mini-flow">
              <b>
                2
              </b>

              <div>
                Location
              </div>
            </div>

            <div className="cp-mini-flow">
              <b>
                3
              </b>

              <div>
                Photos
              </div>
            </div>

            <div className="cp-mini-flow">
              <b>
                4
              </b>

              <div>
                AI Analysis
              </div>
            </div>

            <div className="cp-mini-flow">
              <b>
                5
              </b>

              <div>
                Civic Report
              </div>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

