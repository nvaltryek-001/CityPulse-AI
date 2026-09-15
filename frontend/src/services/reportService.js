/**
 * CityPulse AI
 * Report Service
 *
 * Current:
 * LocalStorage persistence.
 *
 * Future:
 * Script 10 will replace these persistence functions
 * with secure backend API calls.
 */

import {
  createReportId,
  normalizeReport,
  getPriority,
  getDepartment,
  getExpectedResponse
} from "../models/reportModel";

import {
  validateReport
} from "../utils/reportValidation";

const KEYS = {
  draft: "citypulse_report_draft",
  current: "citypulse_current_report",
  reports: "citypulse_reports"
};

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Create a fresh report.
 */
export function createReport(data = {}) {
  const report = normalizeReport({
    ...data,
    id: data.id || createReportId()
  });

  return report;
}

/**
 * Save temporary report draft.
 */
export function saveDraft(report) {
  const normalized = normalizeReport(report);

  write(KEYS.draft, normalized);

  return normalized;
}

/**
 * Get temporary report draft.
 */
export function getDraft() {
  return read(KEYS.draft, null);
}

/**
 * Remove draft.
 */
export function clearDraft() {
  try {
    localStorage.removeItem(KEYS.draft);
  } catch {}
}

/**
 * Save currently generated report.
 */
export function saveCurrentReport(report) {
  const normalized = normalizeReport(report);

  write(KEYS.current, normalized);

  return normalized;
}

/**
 * Get current report.
 */
export function getCurrentReport() {
  return read(KEYS.current, null);
}

/**
 * Get all saved reports.
 */
export function getReports() {
  const reports = read(KEYS.reports, []);

  return Array.isArray(reports)
    ? reports
    : [];
}

/**
 * Save a report into report history.
 */
export function saveReport(report) {
  const normalized = normalizeReport(report);

  const validation =
    validateReport(normalized);

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
      report: normalized
    };
  }

  const reports = getReports();

  const existingIndex =
    reports.findIndex(
      (item) =>
        item.id === normalized.id
    );

  let nextReports;

  if (existingIndex >= 0) {
    nextReports = [...reports];

    nextReports[existingIndex] =
      normalized;
  } else {
    nextReports = [
      normalized,
      ...reports
    ];
  }

  write(KEYS.reports, nextReports);

  saveCurrentReport(normalized);

  return {
    success: true,
    errors: {},
    report: normalized
  };
}

/**
 * Update report status.
 */
export function updateReportStatus(
  reportId,
  status
) {
  const reports = getReports();

  const updated = reports.map(
    (report) =>
      report.id === reportId
        ? {
            ...report,
            status,
            updatedAt:
              new Date().toISOString()
          }
        : report
  );

  write(KEYS.reports, updated);

  const current =
    getCurrentReport();

  if (
    current &&
    current.id === reportId
  ) {
    saveCurrentReport({
      ...current,
      status,
      updatedAt:
        new Date().toISOString()
    });
  }

  return updated.find(
    (report) =>
      report.id === reportId
  ) || null;
}

/**
 * Get one report.
 */
export function getReportById(id) {
  return getReports().find(
    (report) =>
      report.id === id
  ) || null;
}

/**
 * Delete one local report.
 *
 * This will later become a backend operation.
 */
export function deleteReport(id) {
  const reports =
    getReports().filter(
      (report) =>
        report.id !== id
    );

  write(KEYS.reports, reports);

  return reports;
}

/**
 * Clear all local reports.
 */
export function clearAllReports() {
  try {
    localStorage.removeItem(
      KEYS.reports
    );

    localStorage.removeItem(
      KEYS.current
    );

    localStorage.removeItem(
      KEYS.draft
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate a report's priority.
 */
export function calculateReportPriority(
  severity,
  safetyRisk,
  trafficImpact
) {
  return getPriority(
    severity,
    safetyRisk,
    trafficImpact
  );
}

/**
 * Determine department.
 */
export function determineDepartment(
  category
) {
  return getDepartment(category);
}

/**
 * Determine expected response.
 */
export function determineExpectedResponse(
  priority
) {
  return getExpectedResponse(
    priority
  );
}

/**
 * Backend payload helper.
 *
 * Script 10 will use this when sending
 * the report to the Express API.
 */
export function toApiPayload(report) {
  const normalized =
    normalizeReport(report);

  return {
    id: normalized.id,
    issueType:
      normalized.issueType,
    category:
      normalized.category,
    description:
      normalized.description,

    severity:
      normalized.severity,

    safetyRisk:
      normalized.safetyRisk,

    trafficImpact:
      normalized.trafficImpact,

    location:
      normalized.location,

    latitude:
      normalized.latitude,

    longitude:
      normalized.longitude,

    accuracy:
      normalized.accuracy,

    images:
      normalized.images,

    aiAnalysis:
      normalized.aiAnalysis,

    department:
      normalized.department,

    priority:
      normalized.priority,

    status:
      normalized.status,

    expectedResponse:
      normalized.expectedResponse,

    createdAt:
      normalized.createdAt,

    updatedAt:
      normalized.updatedAt,

    metadata:
      normalized.metadata
  };
}

/**
 * Compatibility alias used by ReportIssue.
 * Draft persistence is intentionally kept in one service.
 */
export function saveDraftReport(report) {
  return saveCurrentReport(report);
}
