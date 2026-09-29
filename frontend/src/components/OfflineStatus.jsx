import React from "react";

const STORAGE_KEY = "citypulse-offline-drafts";

function getDraftCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return 0;
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.length
      : 0;
  } catch {
    return 0;
  }
}

export default function OfflineStatus() {
  const [online, setOnline] =
    React.useState(
      typeof navigator === "undefined"
        ? true
        : navigator.onLine
    );

  const [draftCount, setDraftCount] =
    React.useState(getDraftCount());

  React.useEffect(() => {
    const updateOnline = () => {
      setOnline(navigator.onLine);
    };

    window.addEventListener(
      "online",
      updateOnline
    );

    window.addEventListener(
      "offline",
      updateOnline
    );

    const refreshDrafts = () => {
      setDraftCount(getDraftCount());
    };

    window.addEventListener(
      "storage",
      refreshDrafts
    );

    const timer = window.setInterval(
      refreshDrafts,
      3000
    );

    return () => {
      window.removeEventListener(
        "online",
        updateOnline
      );

      window.removeEventListener(
        "offline",
        updateOnline
      );

      window.removeEventListener(
        "storage",
        refreshDrafts
      );

      window.clearInterval(timer);
    };
  }, []);

  return (
    <div
      className={
        online
          ? "offline-status online"
          : "offline-status offline"
      }
      title={
        online
          ? "CityPulse is connected"
          : "CityPulse is currently offline"
      }
    >
      <span className="offline-status-dot" />

      <span>
        {online
          ? "Online"
          : "Offline"}
      </span>

      {!online && draftCount > 0 && (
        <strong>
          {draftCount} pending
        </strong>
      )}
    </div>
  );
}
