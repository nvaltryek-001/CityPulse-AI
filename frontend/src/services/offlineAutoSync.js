import { cityPulseApi } from "./cityPulseApi.js";
import {
  getOfflineDrafts,
  removeOfflineDraft
} from "./offlineDraftStore.js";

let syncing = false;

export async function syncOfflineDrafts() {
  if (syncing) {
    return {
      synced: 0,
      failed: 0,
      skipped: true
    };
  }

  if (
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {
    return {
      synced: 0,
      failed: 0,
      skipped: true
    };
  }

  const drafts =
    getOfflineDrafts();

  if (!drafts.length) {
    return {
      synced: 0,
      failed: 0,
      skipped: false
    };
  }

  syncing = true;

  let synced = 0;
  let failed = 0;

  try {
    for (const draft of drafts) {
      try {
        await cityPulseApi.createReport(
          draft.payload
        );

        removeOfflineDraft(
          draft.id
        );

        synced += 1;
      } catch {
        failed += 1;
      }
    }
  } finally {
    syncing = false;
  }

  return {
    synced,
    failed,
    skipped: false
  };
}

export function startOfflineAutoSync() {
  const run = () => {
    syncOfflineDrafts();
  };

  window.addEventListener(
    "online",
    run
  );

  const timer = window.setInterval(
    run,
    30000
  );

  run();

  return () => {
    window.removeEventListener(
      "online",
      run
    );

    window.clearInterval(timer);
  };
}
