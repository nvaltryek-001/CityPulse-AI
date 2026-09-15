const QUEUE_KEY = "citypulse_offline_report_queue";

function safeParse(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function readStorage() {
  if (typeof localStorage === "undefined") {
    return [];
  }

  return safeParse(localStorage.getItem(QUEUE_KEY));
}

function writeStorage(items) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(
    QUEUE_KEY,
    JSON.stringify(items)
  );
}

export async function getOfflineReports() {
  return readStorage();
}

export async function enqueueOfflineReport(payload) {
  const queue = readStorage();

  const queueItem = {
    queueId:
      globalThis.crypto?.randomUUID?.() ||
      `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    payload
  };

  queue.push(queueItem);

  writeStorage(queue);

  return queueItem;
}

export async function removeOfflineReport(queueId) {
  const queue = readStorage();

  const filtered = queue.filter(
    (item) =>
      item.queueId !== queueId &&
      item.id !== queueId &&
      item.reportId !== queueId
  );

  writeStorage(filtered);

  return true;
}

export async function clearOfflineReports() {
  writeStorage([]);

  return true;
}

export function getOfflineQueueKey() {
  return QUEUE_KEY;
}

export default {
  getOfflineReports,
  enqueueOfflineReport,
  removeOfflineReport,
  clearOfflineReports,
  getOfflineQueueKey
};
