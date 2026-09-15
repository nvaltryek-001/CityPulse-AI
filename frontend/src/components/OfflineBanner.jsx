import React from "react";

import {
  useOfflineStatus
} from "../hooks/useOfflineStatus";

export default function OfflineBanner() {

  const {
    online,
    pendingCount,
    syncing
  } =
    useOfflineStatus();

  if (
    online &&
    pendingCount === 0 &&
    !syncing
  ) {
    return null;
  }

  if (!online) {
    return (
      <div
        className="citypulse-offline-banner citypulse-offline-banner--offline"
        role="status"
      >
        <span className="citypulse-offline-dot" />

        <div>
          <strong>
            You're offline
          </strong>

          <span>
            New reports will be saved
            securely on this device and
            synced when you're back online.
          </span>
        </div>

        {pendingCount > 0 && (
          <b>
            {pendingCount} pending
          </b>
        )}
      </div>
    );
  }

  if (syncing) {
    return (
      <div
        className="citypulse-offline-banner citypulse-offline-banner--syncing"
        role="status"
      >
        <span>
          🔄
        </span>

        <div>
          <strong>
            Syncing reports
          </strong>

          <span>
            Sending your offline reports
            to CityPulse AI...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="citypulse-offline-banner citypulse-offline-banner--pending"
      role="status"
    >
      <span>
        ✓
      </span>

      <div>
        <strong>
          Reports waiting to sync
        </strong>

        <span>
          {pendingCount} report
          {pendingCount === 1
            ? ""
            : "s"} will be uploaded.
        </span>
      </div>
    </div>
  );
}
