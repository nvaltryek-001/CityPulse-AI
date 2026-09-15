import {
  useState
} from "react";

import ExploreMap
  from "../components/ExploreMap.jsx";

export default function Explore() {

  const [category, setCategory] =
    useState("");

  const [status, setStatus] =
    useState("");

  const categories = [
    "Electrical",
    "Solid Waste (Garbage) Related",
    "Road Maintenance(Engg)",
    "Storm Water Drain(SWD)",
    "Health Dept",
    "Sanitation",
    "Water Supply",
    "Street Lights"
  ];

  return (
    <main className="explore-page">

      <section className="explore-header">

        <div>

          <span className="explore-eyebrow">
            CITY INTELLIGENCE
          </span>

          <h1>
            Explore Civic Issues
          </h1>

          <p>
            Discover nearby CityPulse reports
            using real GPS data and explore
            Bengaluru's civic issue intelligence.
          </p>

        </div>

        <div className="explore-live">

          <span className="live-pulse" />

          LIVE DATA

        </div>

      </section>

      <section className="explore-filter-bar">

        <div className="filter-title">
          <span>FILTER ISSUES</span>
        </div>

        <select
          value={category}
          onChange={event =>
            setCategory(event.target.value)
          }
        >
          <option value="">
            All categories
          </option>

          {categories.map(item => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}

        </select>

        <select
          value={status}
          onChange={event =>
            setStatus(event.target.value)
          }
        >
          <option value="">
            All statuses
          </option>

          <option value="open">
            Open
          </option>

          <option value="in-progress">
            In progress
          </option>

          <option value="resolved">
            Resolved
          </option>

          <option value="rejected">
            Rejected
          </option>

        </select>

        <button
          type="button"
          className="clear-filter"
          onClick={() => {
            setCategory("");
            setStatus("");
          }}
        >
          Clear filters
        </button>

      </section>

      <section className="explore-map-section">

        <ExploreMap
          selectedCategory={category}
          selectedStatus={status}
        />

      </section>

    </main>
  );
}
