import {
  queueOfflineReport,
  getPendingReports,
  getPendingCount
} from "./offlineDb";

import {
  syncOfflineReports
} from "./offlineSyncService";

export async function saveReportOffline(
  report
) {
  const record =
    await queueOfflineReport(
      report
    );

  if (
    typeof navigator !==
      "undefined" &&
    navigator.onLine
  ) {
    try {
      await syncOfflineReports();
    } catch {
      // Keep the report queued.
    }
  }

  return record;
}

export {
  getPendingReports,
  getPendingCount,
  syncOfflineReports
};
