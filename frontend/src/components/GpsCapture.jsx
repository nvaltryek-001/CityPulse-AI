import {
  useState
} from "react";

import {
  getRequiredGps
} from "../services/gpsService.js";

export default function GpsCapture({
  value,
  onChange
}) {

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function captureLocation() {

    setLoading(true);
    setError("");

    try {

      const gps =
        await getRequiredGps();

      if (onChange) {
        onChange(gps);
      }

    } catch (gpsError) {

      console.error(
        "GPS capture error:",
        gpsError
      );

      setError(
        gpsError.message ||
        "Unable to capture GPS."
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "14px",
        border: "1px solid rgba(0,0,0,.08)",
        borderRadius: "14px",
        background: "#fff",
        boxSizing: "border-box"
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >

        <div>

          <strong
            style={{
              display: "block",
              fontSize: "13px"
            }}
          >
            📍 Report location
          </strong>

          <span
            style={{
              display: "block",
              marginTop: "4px",
              fontSize: "11px",
              opacity: ".6"
            }}
          >
            Use your real GPS location for this report.
          </span>

        </div>

        <button
          type="button"
          onClick={captureLocation}
          disabled={loading}
          style={{
            border: 0,
            borderRadius: "10px",
            padding: "10px 14px",
            cursor: loading
              ? "wait"
              : "pointer",
            fontWeight: 800
          }}
        >
          {loading
            ? "Locating..."
            : value
              ? "Update location"
              : "Use my location"}
        </button>

      </div>

      {value && (

        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            borderRadius: "9px",
            background: "#f5f7fa",
            fontSize: "11px"
          }}
        >

          <div>
            <b>Latitude:</b>{" "}
            {Number(value.latitude).toFixed(6)}
          </div>

          <div>
            <b>Longitude:</b>{" "}
            {Number(value.longitude).toFixed(6)}
          </div>

          {value.accuracy !== null &&
            value.accuracy !== undefined && (
              <div>
                <b>Accuracy:</b>{" "}
                {Math.round(value.accuracy)} m
              </div>
            )}

        </div>

      )}

      {error && (

        <div
          style={{
            marginTop: "10px",
            fontSize: "11px",
            fontWeight: 700
          }}
        >
          {error}
        </div>

      )}

    </div>
  );
}
