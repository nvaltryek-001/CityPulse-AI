import React from "react";

const STEPS = [
  ["report", "Report"],
  ["photos", "Photos"],
  ["analysis", "AI Analysis"],
  ["gps", "GPS"],
  ["civic-report", "Civic Report"],
  ["complete", "Submitted"]
];

export default function ReportPipelineStatus({
  current = "report"
}) {

  const activeIndex =
    Math.max(
      0,
      STEPS.findIndex(
        ([key]) => key === current
      )
    );

  return (
    <div className="report-pipeline-status">

      {STEPS.map(
        ([key, label], index) => {

          const completed =
            index < activeIndex;

          const active =
            index === activeIndex;

          return (
            <div
              key={key}
              className={[
                "report-pipeline-step",
                active ? "active" : "",
                completed ? "completed" : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >

              <div className="report-pipeline-dot">
                {completed
                  ? "✓"
                  : index + 1}
              </div>

              <span>
                {label}
              </span>

            </div>
          );
        }
      )}

    </div>
  );
}
