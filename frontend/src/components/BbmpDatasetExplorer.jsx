import React from "react";
import { cityPulseApi } from "../services/cityPulseApi.js";

export default function BbmpDatasetExplorer() {

  const [records, setRecords] =
    React.useState([]);

  const [total, setTotal] =
    React.useState(0);

  const [loading, setLoading] =
    React.useState(false);

  const [error, setError] =
    React.useState("");

  const [search, setSearch] =
    React.useState("");

  const [year, setYear] =
    React.useState("");

  const [category, setCategory] =
    React.useState("");

  const [status, setStatus] =
    React.useState("");

  const [ward, setWard] =
    React.useState("");

  const load = React.useCallback(
    async () => {

      setLoading(true);
      setError("");

      try {

        const [data, stats] =
          await Promise.all([
            cityPulseApi.civicData({
              search,
              year,
              category,
              status,
              wardName: ward,
              limit: 50
            }),

            cityPulseApi.civicDatasetAnalytics()
          ]);

        setRecords(
          Array.isArray(data?.records)
            ? data.records
            : []
        );

        setTotal(
          Number(stats?.total) || 0
        );

      } catch (requestError) {

        setError(
          requestError?.message ||
          "Unable to load BBMP dataset."
        );

      } finally {

        setLoading(false);
      }

    },
    [
      search,
      year,
      category,
      status,
      ward
    ]
  );

  React.useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const categories = [
    "",
    "Road Infrastructure",
    "Waste Management",
    "Electrical",
    "Forest",
    "Health",
    "veterinary",
    "Road Infrastructure",
    "Storm Water Drain",
    "Parks",
    "Sanitation"
  ];

  const statuses = [
    "",
    "resolved",
    "open",
    "in-progress",
    "rejected"
  ];

  return (
    <section className="panel cp-dataset-explorer">

      <div className="cp-dataset-head">

        <div>

          <span className="eyebrow">
            REAL BBMP DATA
          </span>

          <h2>
            BBMP Civic Dataset Explorer
          </h2>

          <p>
            Search and reuse historical civic intelligence
            from the imported MongoDB dataset.
          </p>

        </div>

        <div className="cp-dataset-total">

          <small>
            TOTAL RECORDS
          </small>

          <strong>
            {total.toLocaleString()}
          </strong>

        </div>

      </div>

      <div className="cp-dataset-filters">

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search category, sub-category, ward, remarks..."
        />

        <select
          value={year}
          onChange={(event) =>
            setYear(event.target.value)
          }
        >

          <option value="">
            All years
          </option>

          {["2020","2021","2022","2023","2024","2025"].map(
            (value) => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            )
          )}

        </select>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
        >

          <option value="">
            All categories
          </option>

          {categories
            .filter(Boolean)
            .filter(
              (value, index, array) =>
                array.indexOf(value) === index
            )
            .map((value) => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            ))}

        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >

          {statuses.map((value) => (
            <option
              key={value || "all"}
              value={value}
            >
              {value || "All statuses"}
            </option>
          ))}

        </select>

        <input
          value={ward}
          onChange={(event) =>
            setWard(event.target.value)
          }
          placeholder="Ward"
        />

      </div>

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      <div className="cp-dataset-meta">

        <span>
          Showing {records.length} filtered records
        </span>

        <button
          type="button"
          className="button soft"
          onClick={load}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      <div className="cp-dataset-table-wrap">

        <table className="cp-dataset-table">

          <thead>
            <tr>
              <th>Year</th>
              <th>Category</th>
              <th>Sub-category</th>
              <th>Ward</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {records.map(
              (record, index) => (

                <tr
                  key={
                    record.externalId ||
                    `${index}-${record.grievanceDate}`
                  }
                >

                  <td>
                    {String(
                      record.sourceDataset || ""
                    ).replace(
                      "BBMP Grievances ",
                      ""
                    )}
                  </td>

                  <td>
                    {record.category || "Other"}
                  </td>

                  <td>
                    {record.subCategory || "—"}
                  </td>

                  <td>
                    {record.wardName || "—"}
                  </td>

                  <td>
                    <span className="cp-status-pill">
                      {record.status || "open"}
                    </span>
                  </td>

                  <td>
                    {record.grievanceDate || "—"}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

        {!records.length && !loading && (
          <div className="analytics-empty">
            No BBMP records matched these filters.
          </div>
        )}

      </div>

      <div className="cp-dataset-note">
        Historical BBMP records are reference/intelligence
        data. They are not converted into fake GPS points
        or fake problem images.
      </div>

    </section>
  );
}
