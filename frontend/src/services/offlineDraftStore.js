const STORAGE_KEY = "citypulse-offline-drafts";

function readDrafts() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(drafts)
    );

    window.dispatchEvent(
      new Event("storage")
    );

    return true;
  } catch {
    return false;
  }
}

export function getOfflineDrafts() {
  return readDrafts();
}

export function saveOfflineDraft(payload) {
  const drafts = readDrafts();

  const draft = {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `offline-${Date.now()}`,
    createdAt:
      new Date().toISOString(),
    status: "Pending Sync",
    payload
  };

  drafts.unshift(draft);

  writeDrafts(drafts);

  return draft;
}

export function removeOfflineDraft(id) {
  const drafts = readDrafts();

  writeDrafts(
    drafts.filter(
      (item) => item.id !== id
    )
  );
}

export function clearOfflineDrafts() {
  writeDrafts([]);
}

export function getOfflineDraftCount() {
  return readDrafts().length;
}
