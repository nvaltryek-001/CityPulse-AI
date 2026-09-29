import React from "react";
import { cityPulseApi } from "../services/cityPulseApi.js";

const categories = [
  "All",
  "Electrical",
  "Solid Waste (Garbage) Related",
  "Road Maintenance(Engg)",
  "Road Infrastructure",
  "Forest",
  "Health Dept",
  "veterinary",
  "Storm  Water Drain(SWD)",
  "Revenue Department",
  "Parks and Play grounds"
];

const statuses = [
  "All",
  "open",
  "resolved",
  "in-progress",
  "rejected"
];

export default function CivicExplorer() {
  const [records, setRecords] =
    React.useState([]);

  const [reports, setReports] =
    React.useState([]);

  const [loading, setLoading] =
    React.useState(true);

  const [error, setError] =
    React.useState("");

  const [search, setSearch] =
    React.useState("");

  const [category, setCategory] =
    React.useState("All");

  const [status, setStatus] =
    React.useState("All");

  const [year, setYear] =
    React.useState("All");

  const load =
    React.useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const [
            civicResponse,
            reportResponse
          ] = await Promise.all([
            cityPulseApi.civicData({
              limit: 50
            }),
            cityPulseApi.reports()
          ]);

          setRecords(
            Array.isArray(
              civicResponse?.records
            )
              ? civicResponse.records
              : []
          );

          setReports(
            Array.isArray(
              reportResponse?.data
            )
              ? reportResponse.data
              : []
          );
        }
        catch (loadError) {
          setError(
            loadError?.message ||
            "Unable to load civic intelligence."
          );
        }
        finally {
          setLoading(false);
        }
      },
      []
    );

  React.useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered =
    records.filter(
      (record) => {
        const text =
          [
            record.category,
            record.subCategory,
            record.wardName,
            record.status,
            record.externalId
          ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
          !search.trim() ||
          text.includes(
            search
              .trim()
              .toLowerCase()
          );

        const matchesCategory =
          category === "All" ||
          record.category ===
            category;

        const matchesStatus =
          status === "All" ||
          record.status ===
            status;

        const datasetYear =
          String(
            record.sourceDataset ||
            ""
          ).match(/\d{4}/)?.[0] ||
          "";

        const matchesYear =
          year === "All" ||
          datasetYear === year;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesYear
        );
      }
    );

  const applyAsTemplate =
    (record) => {
      localStorage.setItem(
        "citypulse_report_prefill",
        JSON.stringify({
          category:
            record.category ||
            "Other",

          issueType:
            record.subCategory ||
            record.category ||
            "Civic Issue",

          description:
            `Historical pattern for reference: ${record.subCategory || record.category || "Civic issue"}. Describe what is happening at the current location now.`
        })
      );

      window.dispatchEvent(
        new CustomEvent(
          "citypulse:navigate",
          {
            detail: "report"
          }
        )
      );
    };

  return (
    <div className="cpv-page">

      <div className="cpv-page-intro">
        <span className="cpv-eyebrow">
          CIVIC INTELLIGENCE
        </span>

        <h1>
          Explore civic activity
        </h1>

        <p>
          Browse the complete BBMP
          intelligence layer and the
          current CityPulse reports
          without artificial map markers.
        </p>
      </div>

      {error && (
        <div className="cpv-error">
          {error}
        </div>
      )}

      <section className="cpv-intel-summary">

        <div>
          <span>
            BBMP dataset
          </span>

          <strong>
            766,648+
          </strong>

          <small>
            Historical civic records
          </small>
        </div>

        <div>
          <span>
            Current reports
          </span>

          <strong>
            {reports.length}
          </strong>

          <small>
            Stored in MongoDB
          </small>
        </div>

        <div>
          <span>
            Dataset years
          </span>

          <strong>
            2020–2025
          </strong>

          <small>
            Historical coverage
          </small>
        </div>

        <div>
          <span>
            Current evidence
          </span>

          <strong>
            GPS + Photo
          </strong>

          <small>
            Required for new reports
          </small>
        </div>

      </section>

      <section className="cpv-card">

        <div className="cpv-toolbar">

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search issue, sub-category, ward or record ID..."
          />

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >
            {categories.map(
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

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
          >
            {statuses.map(
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

          <select
            value={year}
            onChange={(event) =>
              setYear(
                event.target.value
              )
            }
          >
            <option value="All">
              All years
            </option>

            {[
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025"
            ].map(
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

        </div>

        <div className="cpv-table-head">
          <span>
            Historical BBMP records
          </span>

          <strong>
            {filtered.length}
            {" "}
            shown
          </strong>
        </div>

        {loading && (
          <div className="cpv-empty">
            Loading civic dataset…
          </div>
        )}

        {!loading &&
          filtered.length === 0 && (
            <div className="cpv-empty">
              No matching civic records.
            </div>
          )}

        {!loading &&
          filtered.length > 0 && (
            <div className="cpv-table-wrap">

              <table>
                <thead>
                  <tr>
                    <th>
                      Year
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Issue
                    </th>

                    <th>
                      Ward
                    </th>

                    <th>
                      Status
                    </th>

                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filtered
                    .slice(0, 50)
                    .map(
                      (record) => {
                        const recordYear =
                          String(
                            record.sourceDataset ||
                            ""
                          ).match(
                            /\d{4}/
                          )?.[0] ||
                          "—";

                        return (
                          <tr
                            key={
                              record.externalId ||
                              record._id
                            }
                          >
                            <td>
                              {recordYear}
                            </td>

                            <td>
                              {record.category ||
                                "—"}
                            </td>

                            <td>
                              <strong>
                                {record.subCategory ||
                                  "—"}
                              </strong>
                            </td>

                            <td>
                              {record.wardName ||
                                "—"}
                            </td>

                            <td>
                              <span className="cpv-status">
                                {record.status ||
                                  "—"}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="cpv-table-action"
                                onClick={() =>
                                  applyAsTemplate(
                                    record
                                  )
                                }
                              >
                                Use as report context
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                </tbody>
              </table>

            </div>
          )}

      </section>

      <section className="cpv-card">

        <div className="cpv-section-head">
          <span className="cpv-eyebrow">
            CITYPULSE REPORTS
          </span>

          <h2>
            Current submitted reports
          </h2>

          <p>
            These are fresh reports stored
            in MongoDB, separate from the
            historical BBMP dataset.
          </p>
        </div>

        {reports.length === 0 && (
          <div className="cpv-empty">
            No live CityPulse reports yet.
          </div>
        )}

        {reports.length > 0 && (
          <div className="cpv-live-list">
            {reports
              .slice(0, 10)
              .map(
                (report) => (
                  <article
                    key={
                      report.reportId ||
                      report._id
                    }
                  >
                    <div>
                      <span>
                        {report.category}
                      </span>

                      <strong>
                        {report.issueType}
                      </strong>

                      <p>
                        {report.description}
                      </p>
                    </div>

                    <div>
                      <span>
                        {report.status}
                      </span>

                      <strong>
                        {report.location?.latitude},
                        {" "}
                        {report.location?.longitude}
                      </strong>
                    </div>
                  </article>
                )
              )}
          </div>
        )}

      </section>

    </div>
  );
}
