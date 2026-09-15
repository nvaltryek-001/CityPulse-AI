import {
  getPendingReports,
  updateOfflineReport,
  removeOfflineReport
} from "./offlineDb";

import {
  createRemoteReport
} from "./reportApi";

let syncing = false;

export async function syncOfflineReports() {

  if (syncing) {
    return {
      synced: 0,
      failed: 0
    };
  }

  if (
    typeof navigator !==
      "undefined" &&
    !navigator.onLine
  ) {
    return {
      synced: 0,
      failed: 0,
      offline: true
    };
  }

  syncing = true;

  let synced = 0;
  let failed = 0;

  try {

    const records =
      await getPendingReports();

    for (
      const record of records
    ) {

      if (
        record.status ===
        "synced"
      ) {
        continue;
      }

      try {

        await updateOfflineReport(
          record.localId,
          {
            status:
              "syncing",
            attempts:
              Number(
                record.attempts || 0
              ) + 1
          }
        );

        const remote =
          await createRemoteReport(
            record.report
          );

        await updateOfflineReport(
          record.localId,
          {
            status:
              "synced",
            remoteReportId:
              remote.reportId,
            remoteReport:
              remote,
            lastError: ""
          }
        );

        synced++;

      } catch (error) {

        failed++;

        await updateOfflineReport(
          record.localId,
          {
            status:
              "failed",
            lastError:
              error?.message ||
              "Sync failed."
          }
        );
      }
    }

  } finally {
    syncing = false;
  }

  return {
    synced,
    failed,
    offline: false
  };
}

export function registerAutoSync(
  callback
) {
  const handleOnline =
    async () => {

      try {
        const result =
          await syncOfflineReports();

        callback?.(
          result
        );
      } catch (error) {
        console.error(
          "Offline sync failed:",
          error
        );
      }
    };

  window.addEventListener(
    "online",
    handleOnline
  );

  return () => {
    window.removeEventListener(
      "online",
      handleOnline
    );
  };
}
