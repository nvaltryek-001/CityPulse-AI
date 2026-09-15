import { syncOfflineReports } from "./offlineReportSubmitter.js";

let syncTimer = null;
let started = false;

export async function runOfflineReportSync() {
  try {
    return await syncOfflineReports();
  } catch (error) {
    return {
      success: false,
      synced: 0,
      remaining: null,
      error: error?.message || "Offline sync failed."
    };
  }
}

export function startAutoSync() {
  if (started || typeof window === "undefined") {
    return;
  }

  started = true;

  runOfflineReportSync();

  window.addEventListener("online", runOfflineReportSync);

  syncTimer = window.setInterval(
    runOfflineReportSync,
    30000
  );
}

export function stopAutoSync() {
  if (typeof window === "undefined") {
    return;
  }

  window.removeEventListener("online", runOfflineReportSync);

  if (syncTimer) {
    window.clearInterval(syncTimer);
    syncTimer = null;
  }

  started = false;
}

export default {
  startAutoSync,
  stopAutoSync,
  runOfflineReportSync
};
