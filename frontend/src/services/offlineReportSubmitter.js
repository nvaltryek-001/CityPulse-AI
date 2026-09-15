import {
  enqueueOfflineReport,
  getOfflineReports,
  removeOfflineReport
} from "./reportOfflineQueue.js";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000/api";

function getReportsEndpoint() {
  return `${API_BASE.replace(/\/$/, "")}/reports`;
}

function isBrowserOnline() {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine !== false;
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: response.ok,
      raw: text
    };
  }
}

export async function submitReportOnline(reportPayload) {
  const response = await fetch(getReportsEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(reportPayload)
  });

  const data = await readResponse(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Report submission failed with HTTP ${response.status}`;

    throw new Error(message);
  }

  return {
    success: true,
    offline: false,
    queued: false,
    data
  };
}

export async function submitReportWithOfflineSupport(reportPayload) {
  if (!reportPayload || typeof reportPayload !== "object") {
    throw new Error("A valid report payload is required.");
  }

  if (!isBrowserOnline()) {
    const queued = await enqueueOfflineReport(reportPayload);

    return {
      success: true,
      offline: true,
      queued: true,
      data: queued
    };
  }

  try {
    return await submitReportOnline(reportPayload);
  } catch (error) {
    const queued = await enqueueOfflineReport(reportPayload);

    return {
      success: true,
      offline: true,
      queued: true,
      fallback: true,
      error: error?.message || "Network submission failed.",
      data: queued
    };
  }
}

export async function syncOfflineReports() {
  if (!isBrowserOnline()) {
    return {
      success: false,
      offline: true,
      synced: 0,
      remaining: (await getOfflineReports()).length
    };
  }

  const queue = await getOfflineReports();

  if (!Array.isArray(queue) || queue.length === 0) {
    return {
      success: true,
      offline: false,
      synced: 0,
      remaining: 0
    };
  }

  let synced = 0;

  for (const item of queue) {
    try {
      await submitReportOnline(item.payload || item.report || item);

      const queueId =
        item.queueId ||
        item.id ||
        item.reportId;

      await removeOfflineReport(queueId);

      synced++;
    } catch {
      break;
    }
  }

  const remainingQueue = await getOfflineReports();

  return {
    success: true,
    offline: false,
    synced,
    remaining: remainingQueue.length
  };
}

export default {
  submitReportOnline,
  submitReportWithOfflineSupport,
  syncOfflineReports
};
