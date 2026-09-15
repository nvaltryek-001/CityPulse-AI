import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  getBrowserLocation,
  getNearbyIssues
} from "../services/nearbyIssueApi.js";

function RecenterMap({ position }) {

  const map = useMap();

  useEffect(() => {

    if (!position) {
      return;
    }

    map.flyTo(
      [position.latitude, position.longitude],
      14,
      {
        duration: 0.8
      }
    );

  }, [map, position]);

  return null;
}

function createIssueIcon(priority) {

  const safePriority =
    String(priority || "medium")
      .toLowerCase();

  let symbol = "●";

  if (safePriority === "high") {
    symbol = "!";
  }

  if (safePriority === "critical") {
    symbol = "!!";
  }

  return L.divIcon({
    className: "citypulse-marker",
    html: `
      <div class="citypulse-marker-pin priority-${safePriority}">
        <span>${symbol}</span>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  });
}

export default function ExploreMap({
  selectedCategory = "",
  selectedStatus = ""
}) {

  const [position, setPosition] =
    useState(null);

  const [issues, setIssues] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [radius, setRadius] =
    useState(5000);

  const [selectedIssue, setSelectedIssue] =
    useState(null);

  const defaultCenter =
    [12.9716, 77.5946];

  async function locateMe() {

    setLocationLoading(true);
    setError("");

    try {

      const gps =
        await getBrowserLocation();

      setPosition(gps);

    } catch (locationError) {

      console.error(locationError);

      setError(
        "Unable to access your location. Please allow browser location permission."
      );

    } finally {

      setLocationLoading(false);
    }
  }

  async function loadIssues(gps = position) {

    if (!gps) {
      return;
    }

    setLoading(true);
    setError("");

    try {

      const result =
        await getNearbyIssues({
          latitude: gps.latitude,
          longitude: gps.longitude,
          radius,
          category: selectedCategory,
          status: selectedStatus,
          limit: 100
        });

      setIssues(
        result?.issues || []
      );

    } catch (apiError) {

      console.error(apiError);

      setError(
        "Unable to load nearby civic issues."
      );

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {

    locateMe();

  }, []);

  useEffect(() => {

    if (position) {
      loadIssues(position);
    }

  }, [
    position,
    radius,
    selectedCategory,
    selectedStatus
  ]);

  const mapCenter =
    useMemo(
      () =>
        position
          ? [
              position.latitude,
              position.longitude
            ]
          : defaultCenter,
      [position]
    );

  return (
    <div className="explore-map-shell">

      <MapContainer
        center={mapCenter}
        zoom={position ? 14 : 12}
        scrollWheelZoom={true}
        className="explore-map"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && (
          <>
            <Marker
              position={[
                position.latitude,
                position.longitude
              ]}
            >
              <Popup>
                <strong>Your location</strong>
                <br />
                GPS accuracy:
                {" "}
                {Math.round(
                  position.accuracy || 0
                )}
                m
              </Popup>
            </Marker>

            <Circle
              center={[
                position.latitude,
                position.longitude
              ]}
              radius={radius}
              pathOptions={{
                fillOpacity: 0.06
              }}
            />

            <RecenterMap
              position={position}
            />
          </>
        )}

        {issues.map(issue => {

          if (
            issue.latitude === undefined ||
            issue.longitude === undefined
          ) {
            return null;
          }

          return (
            <Marker
              key={
                issue.reportId ||
                issue.id
              }
              position={[
                Number(issue.latitude),
                Number(issue.longitude)
              ]}
              icon={
                createIssueIcon(
                  issue.priority
                )
              }
              eventHandlers={{
                click: () =>
                  setSelectedIssue(issue)
              }}
            >
              <Popup>

                <div className="map-popup">

                  <div className="map-popup-source">
                    {issue.source || "CITYPULSE"}
                  </div>

                  <h3>
                    {issue.title ||
                      issue.category ||
                      "Civic Issue"}
                  </h3>

                  <p>
                    {issue.description ||
                      "Civic issue reported in this area."}
                  </p>

                  <div className="map-popup-meta">

                    <span>
                      {issue.category ||
                        "Other"}
                    </span>

                    <span>
                      {issue.status ||
                        "open"}
                    </span>

                    {issue.distanceKm !==
                      undefined && (
                      <span>
                        {issue.distanceKm} km
                      </span>
                    )}

                  </div>

                </div>

              </Popup>
            </Marker>
          );
        })}

      </MapContainer>

      <div className="map-floating-controls">

        <button
          type="button"
          className="map-control-btn"
          onClick={locateMe}
          disabled={locationLoading}
        >
          {locationLoading
            ? "Locating..."
            : "⌖ My location"}
        </button>

        <button
          type="button"
          className="map-control-btn"
          onClick={() => loadIssues()}
          disabled={!position || loading}
        >
          {loading
            ? "Loading..."
            : "↻ Refresh"}
        </button>

      </div>

      <div className="map-radius-control">

        <span>
          Search radius
        </span>

        <select
          value={radius}
          onChange={event =>
            setRadius(
              Number(event.target.value)
            )
          }
        >
          <option value="1000">
            1 km
          </option>
          <option value="2500">
            2.5 km
          </option>
          <option value="5000">
            5 km
          </option>
          <option value="10000">
            10 km
          </option>
          <option value="25000">
            25 km
          </option>
        </select>

      </div>

      <div className="map-status-panel">

        <div>
          <strong>
            {issues.length}
          </strong>

          <span>
            nearby issues
          </span>
        </div>

        <div className="map-status-dot" />

        <span>
          {position
            ? "Live GPS active"
            : "GPS not connected"}
        </span>

      </div>

      {error && (
        <div className="map-error">
          {error}
        </div>
      )}

      {selectedIssue && (
        <div className="map-selected-card">

          <button
            type="button"
            className="map-close"
            onClick={() =>
              setSelectedIssue(null)
            }
          >
            ×
          </button>

          <span className="selected-label">
            CIVIC ISSUE
          </span>

          <h3>
            {selectedIssue.title ||
              selectedIssue.category ||
              "Civic Issue"}
          </h3>

          <p>
            {selectedIssue.description ||
              "No description available."}
          </p>

          <div className="selected-details">

            <span>
              <b>Category</b>
              {selectedIssue.category ||
                "Other"}
            </span>

            <span>
              <b>Status</b>
              {selectedIssue.status ||
                "open"}
            </span>

            <span>
              <b>Priority</b>
              {selectedIssue.priority ||
                "medium"}
            </span>

            {selectedIssue.distanceKm !==
              undefined && (
              <span>
                <b>Distance</b>
                {selectedIssue.distanceKm} km
              </span>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
