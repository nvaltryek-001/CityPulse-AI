import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  LineChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { cityPulseApi } from "../services/cityPulseApi.js";
import BbmpDatasetExplorer from "./BbmpDatasetExplorer.jsx";

function entries(value) {

  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {

    return value
      .map((item) => ({
        name:
          item?._id ||
          item?.name ||
          "Other",

        value:
          Number(
            item?.count ??
            item?.value ??
            0
          ) || 0
      }))
      .filter(
        (item) => item.value >= 0
      );
  }

  return Object.entries(value)
    .map(([name, value]) => ({
      name,
      value: Number(value) || 0
    }));
}

export default function RealAnalytics() {

  const [live, setLive] =
    React.useState({});

  const [bbmp, setBbmp] =
    React.useState({});

  const [loading, setLoading] =
    React.useState(true);

  React.useEffect(() => {

    let active = true;

    Promise.all([
      cityPulseApi.analytics(),
      cityPulseApi.civicDatasetAnalytics()
    ])
      .then(
        ([
          liveResponse,
          bbmpResponse
        ]) => {

          if (!active) {
            return;
          }

          setLive(
            liveResponse?.data ||
            liveResponse ||
            {}
          );

          setBbmp(
            bbmpResponse?.data ||
            bbmpResponse ||
            {}
          );
        }
      )
      .finally(() => {

        if (active) {
          setLoading(false);
        }

      });

    return () => {
      active = false;
    };

  }, []);

  const summary =
    live?.summary ||
    {};

  const bbmpCategories =
    entries(
      bbmp?.categories
    ).sort(
      (a, b) =>
        b.value - a.value
    );

  const bbmpStatuses =
    entries(
      bbmp?.statuses
    );

  const bbmpWards =
    entries(
      bbmp?.wards
    )
      .sort(
        (a, b) =>
          b.value - a.value
      )
      .slice(0, 10);

  const bbmpYears =
    Array.isArray(bbmp?.years)
      ? bbmp.years.map(
          (item) => ({
            year:
              item.year,
            value:
              Number(item.count) || 0
          })
        )
      : [];

  const totalBbmp =
    Number(bbmp?.total) || 0;

  const totalLive =
    Number(summary.total) || 0;

  const resolvedLive =
    Number(summary.resolved) || 0;

  const openLive =
    Number(summary.open) || 0;

  const progressLive =
    Number(summary.inProgress) || 0;

  const highLive =
    Number(summary.high) || 0;

  const criticalLive =
    Number(summary.critical) || 0;

  const pieColors = [
    "#0a74c9",
    "#17a673",
    "#ef8a24",
    "#d74b5c",
    "#7a63c5"
  ];

  return (
    <div className="page">

      <section className="page-heading analytics-live-heading">

        <div>

          <span className="eyebrow">
            DATA INTELLIGENCE
          </span>

          <h1>
            City Analytics
          </h1>

          <p>
            Live CityPulse reports combined with the
            complete BBMP civic intelligence dataset.
          </p>

        </div>

        <span className="analytics-live-status">
          ● LIVE DATA
        </span>

      </section>

      <section className="analytics-live-stats">

        <Metric
          label="BBMP records"
          value={totalBbmp}
          note="2020–2025 historical dataset"
          loading={loading}
        />

        <Metric
          label="Live reports"
          value={totalLive}
          note="Current CityPulse submissions"
          loading={loading}
        />

        <Metric
          label="Live resolved"
          value={resolvedLive}
          note="Current CityPulse"
          loading={loading}
        />

        <Metric
          label="Live open"
          value={openLive}
          note="Needs attention"
          loading={loading}
        />

        <Metric
          label="Live in progress"
          value={progressLive}
          note="Currently active"
          loading={loading}
        />

        <Metric
          label="High priority"
          value={highLive}
          note="Current CityPulse"
          loading={loading}
        />

        <Metric
          label="Critical"
          value={criticalLive}
          note="Current CityPulse"
          loading={loading}
        />

        <Metric
          label="BBMP years"
          value={bbmpYears.length}
          note="2020 through 2025"
          loading={loading}
        />

      </section>

      <section className="analytics-live-grid">

        <ChartCard
          eyebrow="TREND"
          title="BBMP complaints by year"
        >

          <ResponsiveContainer
            width="100%"
            height={340}
          >

            <LineChart
              data={bbmpYears}
              margin={{
                left: 10,
                right: 20,
                top: 10,
                bottom: 10
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="year"
              />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#0a74c9"
                strokeWidth={3}
                dot={{ r: 5 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </ChartCard>

        <ChartCard
          eyebrow="STATUS"
          title="BBMP grievance status"
        >

          <ResponsiveContainer
            width="100%"
            height={340}
          >

            <PieChart>

              <Pie
                data={bbmpStatuses}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >

                {bbmpStatuses.map(
                  (entry, index) => (

                    <Cell
                      key={
                        `${entry.name}-${index}`
                      }
                      fill={
                        pieColors[
                          index %
                          pieColors.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </ChartCard>

        <ChartCard
          eyebrow="CATEGORY"
          title="BBMP category volume"
        >

          <ResponsiveContainer
            width="100%"
            height={480}
          >

            <BarChart
              data={bbmpCategories.slice(0, 15)}
              layout="vertical"
              margin={{
                left: 30,
                right: 30
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                type="number"
              />

              <YAxis
                type="category"
                dataKey="name"
                width={170}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#18a8e0"
                radius={[
                  0,
                  7,
                  7,
                  0
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>

        <ChartCard
          eyebrow="WARDS"
          title="Top 10 BBMP wards"
        >

          <ResponsiveContainer
            width="100%"
            height={480}
          >

            <BarChart
              data={bbmpWards}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                angle={-25}
                textAnchor="end"
                height={80}
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#17a673"
                radius={[
                  7,
                  7,
                  0,
                  0
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>

      </section>

      <BbmpDatasetExplorer />

    </div>
  );
}

function Metric({
  label,
  value,
  note,
  loading
}) {

  return (
    <div className="analytics-live-card">

      <small>
        {label}
      </small>

      <strong>
        {loading
          ? "..."
          : Number(value || 0)
              .toLocaleString()}
      </strong>

      <span>
        {note}
      </span>

    </div>
  );
}

function ChartCard({
  eyebrow,
  title,
  children
}) {

  return (
    <div className="panel analytics-live-panel cp-chart-card">

      <div className="analytics-panel-title">

        <span className="eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

      </div>

      <div className="cp-chart-wrap">
        {children}
      </div>

    </div>
  );
}
