import React, {
  useEffect,
  useState
} from "react";

import {
  getOfflineQueueCount
} from "../services/reportOfflineQueue.js";

import {
  syncOfflineReports
} from "../services/reportAutoSync.js";

export default function OfflineReportStatus() {

  const [
    online,
    setOnline
  ] = useState(
    typeof navigator === "undefined"
      ? true
      : navigator.onLine
  );

  const [
    count,
    setCount
  ] = useState(
    getOfflineQueueCount()
  );

  useEffect(() => {

    const update = () => {

      setOnline(
        navigator.onLine
      );

      setCount(
        getOfflineQueueCount()
      );
    };

    const onlineHandler =
      async () => {

        await syncOfflineReports();

        update();
      };

    window.addEventListener(
      "online",
      onlineHandler
    );

    window.addEventListener(
      "offline",
      update
    );

    const interval =
      window.setInterval(
        update,
        5000
      );

    update();

    return () => {

      window.removeEventListener(
        "online",
        onlineHandler
      );

      window.removeEventListener(
        "offline",
        update
      );

      window.clearInterval(
        interval
      );
    };

  }, []);

  if (online && count === 0) {
    return null;
  }

  return (
    <div
      className={[
        "offline-report-status",
        online
          ? "online-sync"
          : "offline-mode"
      ].join(" ")}
    >

      <span className="offline-status-dot">
        ●
      </span>

      <span>

        {!online
          ? "Offline mode"
          : `${count} report${count === 1 ? "" : "s"} waiting to sync`
        }

      </span>

    </div>
  );
}
