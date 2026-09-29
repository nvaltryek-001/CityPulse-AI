import React from "react";
import { cityPulseApi } from "../services/cityPulseApi.js";
import ReportPdfActions from "./ReportPdfActions.jsx";

const categories = [
  ["Road Infrastructure", "Pothole"],
  ["Waste Management", "Overflowing Waste"],
  ["Street Lighting", "Broken Street Light"],
  ["Water & Drainage", "Water Leakage"],
  ["Public Safety", "Public Safety Issue"],
  ["Environment", "Environmental Issue"],
  ["Other", "Civic Issue"]
];

const departmentMap = {
  "Road Infrastructure": "Roads & Infrastructure",
  "Waste Management": "Solid Waste Management",
  "Street Lighting": "Electrical",
  "Water & Drainage": "Storm Water Drain",
  "Public Safety": "Municipal Services",
  "Environment": "Forest & Environment",
  Other: "Municipal Services"
};

function priorityFromSeverity(value) {
  const severity = Number(value) || 3;

  if (severity >= 5) {
    return "Critical";
  }

  if (severity >= 4) {
    return "High";
  }

  if (severity <= 2) {
    return "Low";
  }

  return "Medium";
}

function fileToDataUrl(file) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(
          String(
            reader.result || ""
          )
        );
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the selected image."
          )
        );
      };

      reader.readAsDataURL(file);
    }
  );
}

export default function ReportFlow({
  onComplete
}) {
  const [step, setStep] =
    React.useState(1);

  const [form, setForm] =
    React.useState({
      category:
        "Road Infrastructure",

      issueType:
        "Pothole",

      description:
        "",

      severity:
        3,

      trafficLevel:
        "Medium",

      safetyRisk:
        3,

      latitude:
        "",

      longitude:
        "",

      accuracy:
        null,

      capturedAt:
        "",

      image:
        null
    });

  const [preview, setPreview] =
    React.useState("");

  const [imageData, setImageData] =
    React.useState("");

  const [history, setHistory] =
    React.useState([]);

  const [historyLoading, setHistoryLoading] =
    React.useState(false);

  const [historyTotal, setHistoryTotal] =
    React.useState(0);

  const [loading, setLoading] =
    React.useState(false);

  const [locationLoading, setLocationLoading] =
    React.useState(false);

  const [error, setError] =
    React.useState("");

  const [submitted, setSubmitted] =
    React.useState(null);

  const update = (
    key,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [key]: value
      })
    );
  };

  React.useEffect(() => {
    const raw =
      localStorage.getItem(
        "citypulse_report_prefill"
      );

    if (!raw) {
      return;
    }

    try {
      const prefill =
        JSON.parse(raw);

// eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(
        (current) => ({
          ...current,

          category:
            prefill.category ||
            current.category,

          issueType:
            prefill.issueType ||
            current.issueType,

          description:
            prefill.description ||
            ""
        })
      );
    }
    catch {
      localStorage.removeItem(
        "citypulse_report_prefill"
      );
    }

    localStorage.removeItem(
      "citypulse_report_prefill"
    );
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);

      try {
        const response =
          await cityPulseApi.civicData({
            limit: 8,
            search:
              form.issueType
          });

        if (cancelled) {
          return;
        }

        const records =
          Array.isArray(
            response?.records
          )
            ? response.records
            : [];

        setHistory(records);

        setHistoryTotal(
          Number(
            response?.total || 0
          )
        );
      }
      catch {
        if (!cancelled) {
          setHistory([]);
          setHistoryTotal(0);
        }
      }
      finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [form.issueType]);

  const captureCurrentLocation =
    () => {
      if (!navigator.geolocation) {
        setError(
          "This browser does not support current-location capture."
        );
        return;
      }

      setLocationLoading(true);
      setError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude =
            Number(
              position.coords.latitude
            ).toFixed(6);

          const longitude =
            Number(
              position.coords.longitude
            ).toFixed(6);

          const accuracy =
            Number.isFinite(
              Number(
                position.coords.accuracy
              )
            )
              ? Math.round(
                  position.coords.accuracy
                )
              : null;

          const capturedAt =
            new Date().toISOString();

          update(
            "latitude",
            latitude
          );

          update(
            "longitude",
            longitude
          );

          update(
            "accuracy",
            accuracy
          );

          update(
            "capturedAt",
            capturedAt
          );

          setLocationLoading(false);
          setError("");
        },
        (locationError) => {
          setLocationLoading(false);

          const messages = {
            1:
              "Location permission was denied. Allow location access and try again.",
            2:
              "Current location could not be determined. Move to an open area and try again.",
            3:
              "Location capture timed out. Please try again."
          };

          setError(
            messages[
              locationError?.code
            ] ||
            "Unable to capture current location."
          );
        },
        {
          enableHighAccuracy:
            true,

          timeout:
            15000,

          maximumAge:
            0
        }
      );
    };

  const handleImage =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Please select a valid image."
        );
        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setError(
          "The problem image must be smaller than 10 MB."
        );
        return;
      }

      try {
        const dataUrl =
          await fileToDataUrl(
            file
          );

        update(
          "image",
          file
        );

        setImageData(
          dataUrl
        );

        setPreview(
          URL.createObjectURL(
            file
          )
        );

        setError("");
      }
      catch (imageError) {
        setError(
          imageError?.message ||
          "Unable to process the image."
        );
      }
    };

  const validate =
    () => {
      if (step === 1) {
        if (
          !form.description.trim()
        ) {
          setError(
            "Describe what is happening at the location."
          );

          return false;
        }
      }

      if (step === 2) {
        const hasGps =
          Number.isFinite(
            Number(
              form.latitude
            )
          ) &&
          Number.isFinite(
            Number(
              form.longitude
            )
          );

        if (!hasGps) {
          setError(
            "Current GPS location is required for a new civic report."
          );

          return false;
        }
      }

      if (step === 3) {
        if (!imageData) {
          setError(
            "Add a fresh photo of the current issue."
          );

          return false;
        }
      }

      setError("");
      return true;
    };

  const next =
    () => {
      if (!validate()) {
        return;
      }

      setStep(
        (current) =>
          Math.min(
            4,
            current + 1
          )
      );
    };

  const back =
    () => {
      setError("");

      setStep(
        (current) =>
          Math.max(
            1,
            current - 1
          )
      );
    };

  const submit =
    async () => {
      if (!validate()) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const severity =
          Number(
            form.severity
          ) || 3;

        const payload = {
          category:
            form.category,

          issueType:
            form.issueType,

          description:
            form.description.trim(),

          severity,

          priority:
            priorityFromSeverity(
              severity
            ),

          trafficLevel:
            form.trafficLevel,

          safetyRisk:
            Number(
              form.safetyRisk
            ) || 3,

          department:
            departmentMap[
              form.category
            ] ||
            "Municipal Services",

          location: {
            address:
              "Current device GPS",

            latitude:
              Number(
                form.latitude
              ),

            longitude:
              Number(
                form.longitude
              ),

            accuracy:
              form.accuracy,

            capturedAt:
              form.capturedAt
          },

          images: [
            {
              name:
                form.image?.name ||
                "problem-image.jpg",

              type:
                form.image?.type ||
                "image/jpeg",

              size:
                form.image?.size ||
                0,

              dataUrl:
                imageData
            }
          ],

          source:
            "CityPulse AI",

          submittedFrom:
            "web",

          status:
            "Submitted"
        };

        const response =
          await cityPulseApi.createReport(
            payload
          );

        const saved =
          response?.data ||
          response?.report ||
          response;

        setSubmitted(
          saved
        );

        if (onComplete) {
          onComplete(
            saved
          );
        }
      }
      catch (submitError) {
        setError(
          submitError?.message ||
          "Unable to submit the civic report."
        );
      }
      finally {
        setLoading(false);
      }
    };

  if (submitted) {
    const reportId =
      submitted?.reportId ||
      submitted?._id ||
      "CITYPULSE-REPORT";

    return (
      <div className="cpv-page cpv-success-page">

        <section className="cpv-success-card">

          <div className="cpv-success-icon">
            ✓
          </div>

          <span className="cpv-eyebrow">
            REPORT SUBMITTED
          </span>

          <h1>
            Your civic report has been created.
          </h1>

          <p className="cpv-success-copy">
            The report is now stored in
            CityPulse MongoDB with the
            current GPS position, current
            submission time and problem
            image.
          </p>

          <div className="cpv-report-id">
            <span>Report ID</span>
            <strong>
              {reportId}
            </strong>
          </div>

          <div className="cpv-success-grid">

            <div>
              <span>Issue</span>
              <strong>
                {form.issueType}
              </strong>
            </div>

            <div>
              <span>Category</span>
              <strong>
                {form.category}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                Submitted
              </strong>
            </div>

            <div>
              <span>GPS</span>
              <strong>
                {form.latitude},
                {" "}
                {form.longitude}
              </strong>
            </div>

          </div>

          {preview && (
            <div className="cpv-success-image">
              <img
                src={preview}
                alt="Submitted civic issue"
              />
            </div>
          )}

          <ReportPdfActions
            report={submitted}
            imageDataOverride={
              imageData
            }
          />

          <div className="cpv-success-next">
            <button
              type="button"
              className="cpv-primary"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(
                    "citypulse:navigate",
                    {
                      detail:
                        "reports"
                    }
                  )
                )
              }
            >
              View My Reports
            </button>

            <button
              type="button"
              className="cpv-secondary"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(
                    "citypulse:navigate",
                    {
                      detail:
                        "report"
                    }
                  )
                )
              }
            >
              Report Another Issue
            </button>
          </div>

        </section>

      </div>
    );
  }

  return (
    <div className="cpv-page">

      <div className="cpv-page-intro">
        <span className="cpv-eyebrow">
          CIVIC REPORTING
        </span>

        <h1>
          Report an issue
        </h1>

        <p>
          Use BBMP history for context,
          then submit the issue happening
          right now with your current GPS
          and fresh evidence.
        </p>
      </div>

      <div className="cpv-stepper">
        {[
          ["1", "Issue"],
          ["2", "Location"],
          ["3", "Evidence"],
          ["4", "Review"]
        ].map(
          ([number, label]) => (
            <div
              key={label}
              className={
                step >= Number(number)
                  ? "cpv-step active"
                  : "cpv-step"
              }
            >
              <span>
                {number}
              </span>

              <strong>
                {label}
              </strong>
            </div>
          )
        )}
      </div>

      {error && (
        <div className="cpv-error">
          {error}
        </div>
      )}

      <section className="cpv-card">

        {step === 1 && (
          <>
            <div className="cpv-section-head">
              <span className="cpv-eyebrow">
                STEP 1
              </span>

              <h2>
                What is happening right now?
              </h2>

              <p>
                Choose the type of civic
                issue and describe the
                current problem.
              </p>
            </div>

            <div className="cpv-category-grid">
              {categories.map(
                ([category, issue]) => (
                  <button
                    type="button"
                    key={category}
                    className={
                      form.category ===
                      category
                        ? "cpv-category active"
                        : "cpv-category"
                    }
                    onClick={() => {
                      update(
                        "category",
                        category
                      );

                      update(
                        "issueType",
                        issue
                      );
                    }}
                  >
                    <strong>
                      {category}
                    </strong>

                    <span>
                      {issue}
                    </span>
                  </button>
                )
              )}
            </div>

            <div className="cpv-field-grid">

              <label className="cpv-field">
                <span>
                  Issue type
                </span>

                <input
                  value={
                    form.issueType
                  }
                  onChange={(event) =>
                    update(
                      "issueType",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="cpv-field">
                <span>
                  Severity
                </span>

                <select
                  value={
                    form.severity
                  }
                  onChange={(event) =>
                    update(
                      "severity",
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  <option value="1">
                    1 — Minor
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
              </label>

              <label className="cpv-field">
                <span>
                  Traffic impact
                </span>

                <select
                  value={
                    form.trafficLevel
                  }
                  onChange={(event) =>
                    update(
                      "trafficLevel",
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
              </label>

              <label className="cpv-field">
                <span>
                  Safety risk
                </span>

                <select
                  value={
                    form.safetyRisk
                  }
                  onChange={(event) =>
                    update(
                      "safetyRisk",
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  <option value="1">
                    1 — Low
                  </option>
                  <option value="2">
                    2 — Limited
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
              </label>

            </div>

            <label className="cpv-field full">
              <span>
                Current issue description
              </span>

              <textarea
                value={
                  form.description
                }
                onChange={(event) =>
                  update(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Describe what you can see now. Mention the problem, visible impact and anything that helps the civic department understand it."
                rows="6"
              />
            </label>

            <div className="cpv-history">

              <div className="cpv-history-head">
                <div>
                  <span className="cpv-eyebrow">
                    BBMP CIVIC INTELLIGENCE
                  </span>

                  <h3>
                    Similar historical issues
                  </h3>
                </div>

                <span>
                  {historyTotal.toLocaleString()}
                  {" "}
                  matching records
                </span>
              </div>

              {historyLoading && (
                <div className="cpv-history-empty">
                  Loading civic history…
                </div>
              )}

              {!historyLoading &&
                history.length === 0 && (
                  <div className="cpv-history-empty">
                    No matching historical
                    records were returned.
                  </div>
                )}

              {!historyLoading &&
                history.length > 0 && (
                  <div className="cpv-history-list">
                    {history
                      .slice(0, 5)
                      .map((item) => (
                        <button
                          type="button"
                          key={
                            item.externalId ||
                            item._id
                          }
                          onClick={() => {
                            update(
                              "issueType",
                              item.subCategory ||
                              form.issueType
                            );
                          }}
                        >
                          <strong>
                            {item.subCategory ||
                              item.category}
                          </strong>

                          <span>
                            {item.wardName ||
                              "Bengaluru"}
                            {" • "}
                            {item.status ||
                              "historical"}
                          </span>
                        </button>
                      ))}
                  </div>
                )}

            </div>

            <div className="cpv-actions">
              <button
                type="button"
                className="cpv-primary"
                onClick={next}
              >
                Continue to Location
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="cpv-section-head">
              <span className="cpv-eyebrow">
                STEP 2
              </span>

              <h2>
                Capture the current location
              </h2>

              <p>
                This report uses the device's
                current GPS coordinates. No map
                is required.
              </p>
            </div>

            <div className="cpv-location-panel">

              <div className="cpv-location-icon">
                GPS
              </div>

              <div>
                <strong>
                  Current device location
                </strong>

                <p>
                  Capture the location at the
                  moment you are submitting
                  the issue.
                </p>
              </div>

              <button
                type="button"
                className="cpv-primary"
                onClick={
                  captureCurrentLocation
                }
                disabled={
                  locationLoading
                }
              >
                {locationLoading
                  ? "Capturing location…"
                  : "Use My Current Location"}
              </button>

            </div>

            {form.latitude &&
              form.longitude && (
                <div className="cpv-gps-grid">

                  <div>
                    <span>
                      Latitude
                    </span>

                    <strong>
                      {form.latitude}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Longitude
                    </span>

                    <strong>
                      {form.longitude}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Accuracy
                    </span>

                    <strong>
                      {form.accuracy
                        ? `${form.accuracy} m`
                        : "Available"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Captured
                    </span>

                    <strong>
                      {form.capturedAt
                        ? new Date(
                            form.capturedAt
                          ).toLocaleString()
                        : "Just now"}
                    </strong>
                  </div>

                </div>
              )}

            <div className="cpv-location-note">
              Your final PDF will contain
              these coordinates and the
              report submission timestamp.
            </div>

            <div className="cpv-actions">

              <button
                type="button"
                className="cpv-secondary"
                onClick={back}
              >
                Back
              </button>

              <button
                type="button"
                className="cpv-primary"
                onClick={next}
              >
                Continue to Evidence
              </button>

            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="cpv-section-head">
              <span className="cpv-eyebrow">
                STEP 3
              </span>

              <h2>
                Add a photo of the issue
              </h2>

              <p>
                Use the camera for the current
                issue or select a photo from
                your device.
              </p>
            </div>

            <div className="cpv-evidence-grid">

              <label className="cpv-evidence-option">

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={
                    handleImage
                  }
                />

                <span>
                  CAMERA
                </span>

                <strong>
                  Capture problem photo
                </strong>

                <small>
                  Use the device camera
                </small>

              </label>

              <label className="cpv-evidence-option">

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleImage
                  }
                />

                <span>
                  GALLERY
                </span>

                <strong>
                  Choose existing photo
                </strong>

                <small>
                  Select an image file
                </small>

              </label>

            </div>

            {preview && (
              <div className="cpv-evidence-preview">

                <img
                  src={preview}
                  alt="Current civic issue"
                />

                <div>
                  <span>
                    Fresh problem evidence
                  </span>

                  <strong>
                    {form.image?.name ||
                      "Problem photo"}
                  </strong>

                  <small>
                    {form.image?.size
                      ? `${(
                          form.image.size /
                          1024 /
                          1024
                        ).toFixed(2)} MB`
                      : ""}
                  </small>
                </div>

              </div>
            )}

            <div className="cpv-actions">

              <button
                type="button"
                className="cpv-secondary"
                onClick={back}
              >
                Back
              </button>

              <button
                type="button"
                className="cpv-primary"
                onClick={next}
              >
                Review Report
              </button>

            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="cpv-section-head">
              <span className="cpv-eyebrow">
                STEP 4
              </span>

              <h2>
                Review before submission
              </h2>

              <p>
                This is a brand-new report.
                Historical BBMP data was used
                only for context.
              </p>
            </div>

            <div className="cpv-review-grid">

              <div>
                <span>
                  Category
                </span>

                <strong>
                  {form.category}
                </strong>
              </div>

              <div>
                <span>
                  Issue
                </span>

                <strong>
                  {form.issueType}
                </strong>
              </div>

              <div>
                <span>
                  Priority
                </span>

                <strong>
                  {priorityFromSeverity(
                    form.severity
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Submission
                </span>

                <strong>
                  New current report
                </strong>
              </div>

            </div>

            <div className="cpv-review-location">
              <span>
                CURRENT GPS LOCATION
              </span>

              <strong>
                {form.latitude},
                {" "}
                {form.longitude}
              </strong>

              <small>
                Accuracy:
                {" "}
                {form.accuracy
                  ? `${form.accuracy} metres`
                  : "Available"}
              </small>
            </div>

            <div className="cpv-review-description">
              <span>
                CURRENT ISSUE DESCRIPTION
              </span>

              <p>
                {form.description}
              </p>
            </div>

            {preview && (
              <div className="cpv-review-image">
                <img
                  src={preview}
                  alt="Problem evidence"
                />

                <div>
                  <span>
                    PROBLEM EVIDENCE
                  </span>

                  <strong>
                    Image will be stored
                    with the report.
                  </strong>
                </div>
              </div>
            )}

            <div className="cpv-actions">

              <button
                type="button"
                className="cpv-secondary"
                onClick={back}
                disabled={loading}
              >
                Back
              </button>

              <button
                type="button"
                className="cpv-primary cpv-submit"
                onClick={submit}
                disabled={loading}
              >
                {loading
                  ? "Submitting to MongoDB…"
                  : "Submit Civic Report"}
              </button>

            </div>

          </>
        )}

      </section>

    </div>
  );
}
