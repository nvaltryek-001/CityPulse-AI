import React, {
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
  calculateDistance
} from "../services/exploreService";

const userIcon =
  new L.DivIcon({
    className:
      "citypulse-user-marker",
    html:
      '<div class="citypulse-user-dot"><span></span></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

const issueIcon =
  new L.DivIcon({
    className:
      "citypulse-issue-marker",
    html:
      '<div class="citypulse-map-pin">●</div>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16]
  });

function RecenterMap({
  position
}) {
  const map = useMap();

  useEffect(() => {
    if (
      position &&
      Number.isFinite(position[0]) &&
      Number.isFinite(position[1])
    ) {
      map.flyTo(
        position,
        Math.max(
          map.getZoom(),
          15
        ),
        {
          duration: 0.8
        }
      );
    }
  }, [position, map]);

  return null;
}

function LocateControl({
  onLocate
}) {
  const map = useMap();

  function locate() {
    if (
      !navigator.geolocation
    ) {
      onLocate?.(
        new Error(
          "Geolocation is not supported."
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [
          position.coords.latitude,
          position.coords.longitude
        ];

        map.flyTo(
          coords,
          17,
          {
            duration: 0.8
          }
        );

        onLocate?.(
          null,
          {
            latitude:
              position.coords.latitude,
            longitude:
              position.coords.longitude,
            accuracy:
              position.coords.accuracy
          }
        );
      },
      (error) => {
        onLocate?.(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  return (
    <button
      type="button"
      className="real-map-locate"
      onClick={locate}
      title="Use my current location"
    >
      📍
    </button>
  );
}

function normalizeIssue(issue) {
  const latitude =
    Number(
      issue?.location?.latitude ??
      issue?.latitude
    );

  const longitude =
    Number(
      issue?.location?.longitude ??
      issue?.longitude
    );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    ...issue,
    latitude,
    longitude
  };
}

export default function RealCityMap({
  issues = [],
  center,
  zoom = 13,
  userLocation = null,
  onLocationChange,
  onIssueClick
}) {
  const [mapError, setMapError] =
    useState("");

  const validIssues =
    useMemo(
      () =>
        issues
          .map(normalizeIssue)
          .filter(Boolean),
      [issues]
    );

  const fallbackCenter =
    Array.isArray(center)
      ? center
      : [20.5937, 78.9629];

  const currentUserPosition =
    userLocation &&
    Number.isFinite(
      Number(
        userLocation.latitude
      )
    ) &&
    Number.isFinite(
      Number(
        userLocation.longitude
      )
    )
      ? [
          Number(
            userLocation.latitude
          ),
          Number(
            userLocation.longitude
          )
        ]
      : null;

  return (
    <div className="real-city-map">

      <MapContainer
        center={
          currentUserPosition ||
          fallbackCenter
        }
        zoom={
          currentUserPosition
            ? 16
            : zoom
        }
        scrollWheelZoom={true}
        className="real-city-map__container"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap
          position={
            currentUserPosition
          }
        />

        <LocateControl
          onLocate={(
            error,
            location
          ) => {
            if (error) {
              setMapError(
                error.message ||
                  "Unable to access location."
              );
              return;
            }

            setMapError("");

            if (
              location &&
              onLocationChange
            ) {
              onLocationChange(
                location
              );
            }
          }}
        />

        {currentUserPosition && (
          <>
            <Marker
              position={
                currentUserPosition
              }
              icon={userIcon}
            >
              <Popup>
                <strong>
                  Your Location
                </strong>
                <br />
                GPS accuracy:{" "}
                {Math.round(
                  Number(
                    userLocation.accuracy ||
                      0
                  )
                )}
                m
              </Popup>
            </Marker>

            <Circle
              center={
                currentUserPosition
              }
              radius={
                Number(
                  userLocation.accuracy ||
                    50
                )
              }
              pathOptions={{
                className:
                  "citypulse-location-radius"
              }}
            />
          </>
        )}

        {validIssues.map(
          (issue) => {

            const distance =
              currentUserPosition
                ? calculateDistance(
                    currentUserPosition[0],
                    currentUserPosition[1],
                    issue.latitude,
                    issue.longitude
                  )
                : null;

            return (
              <Marker
                key={
                  issue.reportId ||
                  issue.id ||
                  `${issue.latitude}-${issue.longitude}`
                }
                position={[
                  issue.latitude,
                  issue.longitude
                ]}
                icon={issueIcon}
                eventHandlers={{
                  click: () =>
                    onIssueClick?.(
                      issue
                    )
                }}
              >
                <Popup>

                  <div className="citypulse-popup">

                    <strong>
                      {issue.category ||
                        issue.issueType ||
                        "Civic Issue"}
                    </strong>

                    <p>
                      {issue.description ||
                        "Civic issue reported at this location."}
                    </p>

                    <div>
                      <b>
                        Status:
                      </b>{" "}
                      {issue.status ||
                        "Submitted"}
                    </div>

                    <div>
                      <b>
                        Priority:
                      </b>{" "}
                      {issue.priority ||
                        "Medium"}
                    </div>

                    {distance !==
                      null && (
                      <div>
                        <b>
                          Distance:
                        </b>{" "}
                        {distance < 1
                          ? `${Math.round(
                              distance * 1000
                            )} m`
                          : `${distance.toFixed(
                              2
                            )} km`}
                      </div>
                    )}

                    <a
                      href={`https://www.openstreetmap.org/?mlat=${issue.latitude}&mlon=${issue.longitude}#map=18/${issue.latitude}/${issue.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in OpenStreetMap
                    </a>

                  </div>

                </Popup>
              </Marker>
            );
          }
        )}

      </MapContainer>

      {mapError && (
        <div className="real-map-error">
          ⚠️ {mapError}
        </div>
      )}

      <div className="real-map-attribution">
        © OpenStreetMap contributors
      </div>

    </div>
  );
}
