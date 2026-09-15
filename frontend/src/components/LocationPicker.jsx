import React, {
  useEffect,
  useState
} from "react";

import {
  getSavedLocation,
  saveLocation,
  getCurrentPosition,
  buildLocation,
  formatCoordinates,
  formatAccuracy,
  getGoogleMapsUrl,
  isGeolocationSupported
} from "../services/locationService";

export default function LocationPicker({
  value,
  onChange
}) {
  const [
    location,
    setLocation
  ] = useState(
    value ||
      getSavedLocation()
  );

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    manualAddress,
    setManualAddress
  ] = useState(
    value?.address ||
      getSavedLocation()?.address ||
      ""
  );

  useEffect(() => {
    if (value) {
      setLocation(
        value
      );

      setManualAddress(
        value.address || ""
      );
    }
  }, [value]);

  const updateLocation =
    (next) => {
      const saved =
        saveLocation(
          next
        );

      setLocation(
        saved
      );

      if (onChange) {
        onChange(
          saved
        );
      }
    };

  const useCurrentLocation =
    async () => {
      setError("");

      if (
        !isGeolocationSupported()
      ) {
        setError(
          "Your browser does not support location services."
        );

        return;
      }

      setLoading(true);

      try {
        const coordinates =
          await getCurrentPosition();

        const next =
          buildLocation(
            coordinates,
            manualAddress,
            "gps"
          );

        updateLocation(
          next
        );
      } catch (
        locationError
      ) {
        setError(
          locationError?.message ||
            "Unable to get your location."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleAddressChange =
    (event) => {
      const address =
        event.target.value;

      setManualAddress(
        address
      );

      const next = {
        ...location,
        address,
        source:
          "manual",
        capturedAt:
          new Date().toISOString()
      };

      updateLocation(
        next
      );
    };

  const coordinatesReady =
    location?.latitude !== null &&
    location?.latitude !== undefined &&
    location?.longitude !== null &&
    location?.longitude !== undefined;

  return (
    <section className="cp-location-card">

      <div className="cp-location-heading">

        <div className="cp-location-icon">
          📍
        </div>

        <div>
          <span className="cp-eyebrow">
            LOCATION
          </span>

          <h3>
            Where is the issue?
          </h3>

          <p>
            Add the exact location so the
            civic team can find the issue.
          </p>
        </div>

      </div>

      <div className="cp-location-input-row">

        <input
          className="cp-location-input"
          type="text"
          value={
            manualAddress
          }
          onChange={
            handleAddressChange
          }
          placeholder="Enter street, area or landmark"
          aria-label="Issue location"
        />

        <button
          type="button"
          className="cp-gps-btn"
          onClick={
            useCurrentLocation
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Locating..."
            : "◎ Use My Location"}
        </button>

      </div>

      {error && (
        <div className="cp-location-error">
          <span>
            !
          </span>

          <p>
            {error}
          </p>
        </div>
      )}

      {coordinatesReady ? (

        <div className="cp-location-result">

          <div className="cp-location-status">
            <span className="cp-location-check">
              ✓
            </span>

            <div>
              <strong>
                Location captured
              </strong>

              <span>
                {location.source ===
                "gps"
                  ? "GPS coordinates ready"
                  : "Location saved"}
              </span>
            </div>
          </div>

          <div className="cp-location-details">

            <div>
              <small>
                COORDINATES
              </small>

              <strong>
                {formatCoordinates(
                  location.latitude,
                  location.longitude
                )}
              </strong>
            </div>

            <div>
              <small>
                ACCURACY
              </small>

              <strong>
                {formatAccuracy(
                  location.accuracy
                )}
              </strong>
            </div>

          </div>

          <div className="cp-location-actions">

            <a
              href={
                getGoogleMapsUrl(
                  location.latitude,
                  location.longitude
                )
              }
              target="_blank"
              rel="noreferrer"
              className="cp-map-link"
            >
              Open in Google Maps ↗
            </a>

          </div>

        </div>

      ) : (

        <div className="cp-location-empty">

          <span>
            ○
          </span>

          <div>
            <strong>
              GPS not captured yet
            </strong>

            <p>
              Click "Use My Location" to
              attach your current coordinates.
            </p>
          </div>

        </div>

      )}

    </section>
  );
}
