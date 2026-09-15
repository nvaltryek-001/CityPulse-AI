import React from "react";

const steps = [
  ["report", "Report"],
  ["photos", "Photos"],
  ["analysis", "AI Analysis"],
  ["gps", "GPS"],
  ["civic-report", "Civic Report"],
  ["complete", "Submitted"]
];

export default function ReportFlowStatus({ current = "report" }) {
  const currentIndex = Math.max(
    0,
    steps.findIndex(([key]) => key === current)
  );

  return (
    <div className="report-flow-status">
      {steps.map(([key, label], index) => {
        const active = index === currentIndex;
        const completed = index < currentIndex;

        return (
          <div
            key={key}
            className={[
              "report-flow-step",
              active ? "active" : "",
              completed ? "completed" : ""
            ].filter(Boolean).join(" ")}
          >
            <span className="report-flow-dot">
              {completed ? "✓" : index + 1}
            </span>

            <span className="report-flow-label">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
