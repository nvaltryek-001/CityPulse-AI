import React, { useEffect, useMemo, useState } from "react";
import RealCityMap from "../components/RealCityMap";
import {
  loadReports
} from "../services/reportFlowService";

export default function ExploreIssues() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const data = await loadReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();

    const handler = () => refresh();

    window.addEventListener(
      "citypulse:report-updated",
      handler
    );

    window.addEventListener(
      "online",
      handler
    );

    return () => {
      window.removeEventListener(
        "citypulse:report-updated",
        handler
      );

      window.removeEventListener(
        "online",
        handler
      );
    };
  }, []);

  const categories = useMemo(() => {
    const values = reports
      .map(
        item =>
          item.category ||
          item.issueType
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values))
    ];
  }, [reports]);

  const filtered = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return reports.filter(item => {
      const category =
        item.category ||
        item.issueType ||
        "General";

      const text = [
        category,
        item.description,
        item?.location?.address,
        item.status,
        item.priority
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !term || text.includes(term);

      const matchesFilter =
        filter === "All" ||
        category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [reports, search, filter]);

  return (
    <main className="page-shell explore-page">
      <section className="page-header">
        <div>
          <span className="eyebrow">
            CITYPULSE NETWORK
          </span>
          <h1>Explore Issues</h1>
          <p>
            Discover civic issues reported across
            the city.
          </p>
        </div>

        <button
          className="btn secondary"
          onClick={refresh}
        >
          ↻ Refresh
        </button>
      </section>

      <section className="explore-toolbar">
        <input
          className="search-input"
          value={search}
          onChange={e =>
            setSearch(e.target.value)
          }
          placeholder="Search issues, locations..."
        />

        <select
          className="filter-select"
          value={filter}
          onChange={e =>
            setFilter(e.target.value)
          }
        >
          {categories.map(category => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <div className="error-card">
          {error}
        </div>
      )}

      <section className="explore-layout">
        <div className="map-panel">
          <RealCityMap reports={filtered} />
        </div>

        <aside className="issue-list-panel">
          <div className="list-heading">
            <div>
              <span className="eyebrow">
                LIVE DATA
              </span>
              <h2>
                {loading
                  ? "Loading..."
                  : `${filtered.length} Issues`}
              </h2>
            </div>
          </div>

          <div className="issue-scroll">
            {!loading &&
              filtered.length === 0 && (
                <div className="empty-state">
                  <div>⌖</div>
                  <h3>No matching issues</h3>
                  <p>
                    Try another category or search.
                  </p>
                </div>
              )}

            {filtered.map((item, index) => {
              const category =
                item.category ||
                item.issueType ||
                "General";

              return (
                <article
                  className="issue-list-card"
                  key={
                    item._id ||
                    item.reportId ||
                    item.id ||
                    index
                  }
                >
                  <div className="issue-card-top">
                    <span className="category-tag">
                      {category}
                    </span>

                    <span className="status-tag">
                      {item.status ||
                        "Submitted"}
                    </span>
                  </div>

                  <h3>
                    {item.description ||
                      category}
                  </h3>

                  <p>
                    {item?.location?.address ||
                      "Location captured"}
                  </p>

                  <div className="issue-card-meta">
                    <span>
                      Priority:{" "}
                      {item.priority ||
                        item?.aiAnalysis?.priority ||
                        "Medium"}
                    </span>

                    <span>
                      {item.reportId ||
                        item._id ||
                        "Report"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </aside>
      </section>
    </main>
  );
}
