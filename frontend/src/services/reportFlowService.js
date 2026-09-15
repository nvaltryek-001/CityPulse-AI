import api from "./apiClient";
import {
  saveReportOffline,
  getPendingReports
} from "./offlineReportService";

const CURRENT_KEY = "citypulse-current-report";
const REPORTS_CACHE_KEY = "citypulse-reports-cache";

export function getCurrentReport() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentReport(report) {
  localStorage.setItem(
    CURRENT_KEY,
    JSON.stringify(report)
  );

  window.dispatchEvent(
    new CustomEvent("citypulse:report-updated", {
      detail: report
    })
  );

  return report;
}

export function clearCurrentReport() {
  localStorage.removeItem(CURRENT_KEY);
}

export async function analyzeReport(payload) {
  const result = await api.analyze(payload);

  const analysis =
    result?.analysis ||
    result?.data ||
    result;

  const current = getCurrentReport() || {};

  return setCurrentReport({
    ...current,
    ...payload,
    aiAnalysis: analysis,
    analysisCompleted: true,
    analyzedAt: new Date().toISOString()
  });
}

export async function submitReport(report) {
  if (!navigator.onLine) {
    const queued = await saveReportOffline(report);

    setCurrentReport({
      ...report,
      status: "pending_sync",
      offlineQueued: true,
      localQueueId: queued?.id
    });

    return {
      offline: true,
      queued: true,
      report: queued
    };
  }

  try {
    const result = await api.createReport(report);

    const saved =
      result?.report ||
      result?.data ||
      result;

    setCurrentReport({
      ...report,
      ...saved,
      status: saved?.status || "submitted",
      submitted: true
    });

    return {
      offline: false,
      queued: false,
      report: saved
    };
  } catch (error) {
    console.warn(
      "Remote submission failed. Queueing offline.",
      error
    );

    const queued = await saveReportOffline(report);

    setCurrentReport({
      ...report,
      status: "pending_sync",
      offlineQueued: true,
      localQueueId: queued?.id,
      syncError: error.message
    });

    return {
      offline: true,
      queued: true,
      report: queued,
      error
    };
  }
}

export async function loadReports(params = {}) {
  if (!navigator.onLine) {
    return getCachedReports();
  }

  try {
    const result = await api.getReports(params);

    const reports =
      Array.isArray(result)
        ? result
        : result?.reports ||
          result?.data ||
          [];

    cacheReports(reports);

    return reports;
  } catch (error) {
    console.warn(
      "Could not load remote reports. Using cache.",
      error
    );

    return getCachedReports();
  }
}

export async function loadReport(id) {
  if (!id) return null;

  try {
    const result = await api.getReport(id);

    return (
      result?.report ||
      result?.data ||
      result
    );
  } catch {
    const cached = getCachedReports();

    return cached.find(
      item =>
        item._id === id ||
        item.id === id ||
        item.reportId === id
    ) || null;
  }
}

export function cacheReports(reports) {
  try {
    localStorage.setItem(
      REPORTS_CACHE_KEY,
      JSON.stringify(reports || [])
    );
  } catch (error) {
    console.warn("Unable to cache reports:", error);
  }
}

export function getCachedReports() {
  try {
    const raw =
      localStorage.getItem(REPORTS_CACHE_KEY);

    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getPendingCount() {
  try {
    const pending = await getPendingReports();
    return Array.isArray(pending)
      ? pending.length
      : 0;
  } catch {
    return 0;
  }
}

export function formatReportId(report) {
  return (
    report?.reportId ||
    report?.id ||
    report?._id ||
    "CITYPULSE-PENDING"
  );
}
