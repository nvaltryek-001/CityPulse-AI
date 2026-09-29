import React from "react";
import { cityPulseApi } from "../services/cityPulseApi.js";

const STATUS_OPTIONS = [
  "Submitted",
  "In Progress",
  "Resolved",
  "Rejected"
];

export default function StatusControl({
  report,
  onSaved
}) {
  const [status, setStatus] =
    React.useState(
      report?.status ||
      "Submitted"
    );

  const [note, setNote] =
    React.useState(
      report?.statusNote ||
      ""
    );

  const [saving, setSaving] =
    React.useState(false);

  const [message, setMessage] =
    React.useState("");

  React.useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(
      report?.status ||
      "Submitted"
    );

    setNote(
      report?.statusNote ||
      ""
    );
  }, [
    report?.reportId,
    report?.status,
    report?.statusNote
  ]);

  const save = async () => {
    if (!report?.reportId) {
      setMessage(
        "Report ID is unavailable."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const now =
        new Date().toISOString();

      const payload = {
        status,
        statusNote:
          note.trim(),
        statusUpdatedAt:
          now,
        resolvedAt:
          status === "Resolved"
            ? now
            : null
      };

      const response =
        await cityPulseApi.updateReport(
          report.reportId,
          payload
        );

      const updated =
        response?.data ||
        response?.report ||
        response;

      setMessage(
        "Status updated successfully."
      );

      if (onSaved) {
        onSaved(updated);
      }
    }
    catch (error) {
      setMessage(
        error?.message ||
        "Unable to update report."
      );
    }
    finally {
      setSaving(false);
    }
  };

  return (
    <div className="cpv-status-control">

      <div className="cpv-status-control-head">
        <div>
          <span>
            MANUAL STATUS UPDATE
          </span>

          <strong>
            Update current work state
          </strong>
        </div>
      </div>

      <div className="cpv-status-control-grid">

        <label>
          <span>
            Status
          </span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
          >
            {STATUS_OPTIONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </label>

        <label className="cpv-status-note">
          <span>
            Work done / update note
          </span>

          <input
            value={note}
            onChange={(event) =>
              setNote(
                event.target.value
              )
            }
            placeholder={
              status === "Resolved"
                ? "Example: Pothole repaired and road surface restored."
                : "Example: Complaint assigned for field inspection."
            }
          />
        </label>

        <button
          type="button"
          className="cpv-primary"
          onClick={save}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Update"}
        </button>

      </div>

      {message && (
        <small className="cpv-status-message">
          {message}
        </small>
      )}

    </div>
  );
}
