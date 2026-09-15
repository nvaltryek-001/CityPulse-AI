import {
  submitReportWithOfflineSupport,
  syncOfflineReports
} from "./offlineReportSubmitter.js";

export async function submitReportSafely(reportPayload) {
  return submitReportWithOfflineSupport(reportPayload);
}

export async function syncQueuedReports() {
  return syncOfflineReports();
}

export function isOfflineMode() {
  return typeof navigator !== "undefined"
    ? navigator.onLine === false
    : false;
}

export default {
  submitReportSafely,
  syncQueuedReports,
  isOfflineMode
};
